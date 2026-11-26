-- ============================================================================
-- PERUMAHAN — Migration 0002: Security Triggers & Atomic Reservation RPCs
-- Mencegah Eskalasi Role, Double Booking, dan Penghapusan Transaksi Terkonfirmasi
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ROLE HELPER FUNCTIONS (SECURITY DEFINER to avoid RLS recursion)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid()
    AND deleted_at IS NULL
    AND is_active = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() = 'super_admin', FALSE);
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_above()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() IN ('admin', 'super_admin'), FALSE);
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() IN ('sales', 'admin', 'super_admin'), FALSE);
$$;

-- ----------------------------------------------------------------------------
-- 2. AUTO-CREATE PROFILE ON AUTH.USERS SIGNUP (ALWAYS ROLE = 'customer')
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    LOWER(NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    'customer' -- Dipaksa selalu customer; metadata role dari client diabaikan total
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. PREVENT SELF ROLE ESCALATION ON PROFILES
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Izinkan operasi dari service role / SQL migration (auth.uid() IS NULL)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active)
     AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Akses ditolak: hanya Super Administrator yang dapat mengubah role atau status aktif akun.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ----------------------------------------------------------------------------
-- 4. PREVENT HARD DELETE / ARBITRARY REMOVAL OF CONFIRMED TRANSACTIONS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_confirmed_reservations()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.status IN ('confirmed', 'completed') THEN
    RAISE EXCEPTION 'Transaksi reservasi yang sudah dikonfirmasi/selesai tidak boleh dihapus.';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IN ('confirmed', 'completed') AND NEW.deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Transaksi reservasi yang sudah dikonfirmasi/selesai tidak boleh di-soft-delete.';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_confirmed_reservations ON public.reservations;
CREATE TRIGGER trg_protect_confirmed_reservations
  BEFORE UPDATE OR DELETE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.protect_confirmed_reservations();

CREATE OR REPLACE FUNCTION public.protect_verified_payments()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' AND OLD.status = 'verified' THEN
    RAISE EXCEPTION 'Data pembayaran yang sudah terverifikasi tidak boleh dihapus.';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'verified' AND NEW.deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Data pembayaran yang sudah terverifikasi tidak boleh dihapus.';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_verified_payments ON public.payments;
CREATE TRIGGER trg_protect_verified_payments
  BEFORE UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.protect_verified_payments();

-- ----------------------------------------------------------------------------
-- 5. RESERVATION NUMBER GENERATOR (RSV-YYYYMMDD-XXXX)
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.reservation_number_seq START 1001;

CREATE OR REPLACE FUNCTION public.generate_reservation_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  seq_val BIGINT;
BEGIN
  seq_val := nextval('public.reservation_number_seq');
  RETURN 'RSV-' || TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD') || '-' || LPAD((seq_val % 10000)::TEXT, 4, '0');
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. RELEASE EXPIRED RESERVATIONS (Safe Scheduled / On-Demand Cleanup)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.release_expired_reservations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  released_count INTEGER := 0;
BEGIN
  FOR rec IN
    SELECT r.id, r.unit_id, r.customer_id, r.reservation_number
    FROM public.reservations r
    WHERE r.status = 'pending'
      AND r.expires_at < NOW()
      AND r.deleted_at IS NULL
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.reservations
    SET status = 'expired',
        cancellation_reason = 'Masa berlaku reservasi telah habis sebelum bukti pembayaran diunggah.'
    WHERE id = rec.id;

    UPDATE public.units
    SET status = 'available'
    WHERE id = rec.unit_id
      AND status = 'reserved';

    INSERT INTO public.notifications (user_id, type, title, message, reference_type, reference_id)
    VALUES (
      rec.customer_id,
      'reservation_expired',
      'Reservasi Kedaluwarsa',
      'Reservasi ' || rec.reservation_number || ' telah melewati batas waktu pembayaran sehingga unit dibuka kembali.',
      'reservation',
      rec.id
    );

    released_count := released_count + 1;
  END LOOP;

  RETURN released_count;
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. ATOMIC UNIT RESERVATION RPC (SELECT ... FOR UPDATE ANTI DOUBLE-BOOKING)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_unit_reservation(
  p_unit_id UUID,
  p_customer_name TEXT,
  p_customer_nik TEXT,
  p_customer_phone TEXT,
  p_customer_address TEXT DEFAULT '',
  p_notes TEXT DEFAULT ''
)
RETURNS public.reservations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_unit public.units%ROWTYPE;
  v_house_type public.house_types%ROWTYPE;
  v_expiry_hours INTEGER := 24;
  v_reservation_number TEXT;
  v_created public.reservations%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Autentikasi diperlukan untuk membuat reservasi.';
  END IF;

  -- Validasi NIK 16 digit di sisi server
  IF p_customer_nik IS NULL OR p_customer_nik !~ '^[0-9]{16}$' THEN
    RAISE EXCEPTION 'NIK harus berupa 16 digit angka yang valid.';
  END IF;

  SELECT email INTO v_user_email
  FROM public.profiles
  WHERE id = v_user_id AND deleted_at IS NULL AND is_active = TRUE;

  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Profil pelanggan aktif tidak ditemukan.';
  END IF;

  -- Bersihkan reservasi pending yang sudah kedaluwarsa terlebih dahulu
  PERFORM public.release_expired_reservations();

  -- ROW-LEVEL LOCK: Mengunci baris unit agar transaksi konkuren menunggu hingga selesai
  SELECT * INTO v_unit
  FROM public.units
  WHERE id = p_unit_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unit tidak ditemukan.';
  END IF;

  IF v_unit.status <> 'available' THEN
    RAISE EXCEPTION 'Unit % sudah tidak tersedia (status saat ini: %).', v_unit.unit_code, v_unit.status;
  END IF;

  SELECT * INTO v_house_type
  FROM public.house_types
  WHERE id = v_unit.house_type_id
    AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tipe rumah untuk unit ini tidak ditemukan.';
  END IF;

  -- Ambil konfigurasi masa berlaku reservasi (fallback ke house_type.reservation_hold_hours)
  SELECT COALESCE((value ->> 'hours')::INTEGER, v_house_type.reservation_hold_hours, 24)
  INTO v_expiry_hours
  FROM public.app_settings
  WHERE key = 'reservation_expiry_hours';

  v_expiry_hours := COALESCE(v_expiry_hours, v_house_type.reservation_hold_hours, 24);
  v_reservation_number := public.generate_reservation_number();

  -- Kunci unit sementara menjadi reserved
  UPDATE public.units
  SET status = 'reserved'
  WHERE id = v_unit.id;

  -- Buat record reservasi
  INSERT INTO public.reservations (
    reservation_number,
    customer_id,
    project_id,
    house_type_id,
    unit_id,
    assigned_sales_id,
    customer_name,
    customer_nik,
    customer_phone,
    customer_email,
    customer_address,
    unit_price,
    booking_fee,
    status,
    expires_at,
    notes
  ) VALUES (
    v_reservation_number,
    v_user_id,
    v_unit.project_id,
    v_unit.house_type_id,
    v_unit.id,
    v_unit.assigned_sales_id,
    TRIM(p_customer_name),
    TRIM(p_customer_nik),
    TRIM(p_customer_phone),
    v_user_email,
    COALESCE(TRIM(p_customer_address), ''),
    v_unit.price,
    v_house_type.booking_fee,
    'pending',
    NOW() + make_interval(hours => v_expiry_hours),
    COALESCE(TRIM(p_notes), '')
  )
  RETURNING * INTO v_created;

  -- Buat tagihan pembayaran manual awal (status = unpaid)
  INSERT INTO public.payments (
    reservation_id,
    customer_id,
    amount,
    status
  ) VALUES (
    v_created.id,
    v_user_id,
    v_house_type.booking_fee,
    'unpaid'
  );

  -- Kirim notifikasi ke pelanggan
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    reference_type,
    reference_id
  ) VALUES (
    v_user_id,
    'reservation_created',
    'Reservasi Unit Berhasil Dibuat',
    'Nomor reservasi ' || v_reservation_number || ' untuk unit ' || v_unit.unit_code || ' berhasil dibuat. Segera transfer booking fee sebelum batas waktu berakhir.',
    'reservation',
    v_created.id
  );

  -- Catat log aktivitas
  INSERT INTO public.activity_logs (
    actor_id,
    actor_role,
    action,
    entity_type,
    entity_id,
    summary,
    metadata
  ) VALUES (
    v_user_id,
    public.current_user_role(),
    'reservation.created',
    'reservation',
    v_created.id,
    'Membuat reservasi ' || v_reservation_number || ' untuk unit ' || v_unit.unit_code,
    jsonb_build_object('unit_id', v_unit.id, 'unit_code', v_unit.unit_code, 'booking_fee', v_house_type.booking_fee)
  );

  RETURN v_created;
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. SUBMIT MANUAL PAYMENT PROOF RPC (CUSTOMER)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_payment_proof(
  p_payment_id UUID,
  p_payment_account_id UUID,
  p_payment_date DATE,
  p_sender_bank TEXT,
  p_sender_name TEXT,
  p_proof_storage_path TEXT,
  p_notes TEXT DEFAULT ''
)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_payment public.payments%ROWTYPE;
  v_reservation public.reservations%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Autentikasi diperlukan.';
  END IF;

  SELECT * INTO v_payment
  FROM public.payments
  WHERE id = p_payment_id
    AND customer_id = v_user_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Data pembayaran tidak ditemukan atau bukan milik akun Anda.';
  END IF;

  SELECT * INTO v_reservation
  FROM public.reservations
  WHERE id = v_payment.reservation_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF v_reservation.status NOT IN ('pending', 'rejected') THEN
    RAISE EXCEPTION 'Bukti pembayaran tidak dapat diunggah untuk status reservasi saat ini (%).', v_reservation.status;
  END IF;

  IF v_reservation.status = 'pending' AND v_reservation.expires_at < NOW() THEN
    PERFORM public.release_expired_reservations();
    RAISE EXCEPTION 'Masa berlaku reservasi telah kedaluwarsa.';
  END IF;

  UPDATE public.payments
  SET payment_account_id = p_payment_account_id,
      payment_date = p_payment_date,
      sender_bank = TRIM(p_sender_bank),
      sender_name = TRIM(p_sender_name),
      proof_storage_path = TRIM(p_proof_storage_path),
      notes = COALESCE(TRIM(p_notes), ''),
      status = 'pending_verification',
      rejection_reason = ''
  WHERE id = v_payment.id
  RETURNING * INTO v_payment;

  UPDATE public.reservations
  SET status = 'awaiting_verification'
  WHERE id = v_reservation.id;

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    reference_type,
    reference_id
  ) VALUES (
    v_user_id,
    'payment_submitted',
    'Bukti Pembayaran Diterima',
    'Bukti transfer untuk reservasi ' || v_reservation.reservation_number || ' telah diterima dan sedang menunggu verifikasi administrator.',
    'payment',
    v_payment.id
  );

  RETURN v_payment;
END;
$$;

-- ----------------------------------------------------------------------------
-- 9. ADMIN PAYMENT VERIFICATION RPC (APPROVE / REJECT)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_manual_payment(
  p_payment_id UUID,
  p_decision TEXT, -- 'verified' | 'rejected'
  p_rejection_reason TEXT DEFAULT '',
  p_notes TEXT DEFAULT ''
)
RETURNS public.payments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id UUID;
  v_payment public.payments%ROWTYPE;
  v_reservation public.reservations%ROWTYPE;
BEGIN
  v_actor_id := auth.uid();
  IF NOT public.is_admin_or_above() THEN
    RAISE EXCEPTION 'Akses ditolak: hanya Administrator atau Super Administrator yang dapat memverifikasi pembayaran.';
  END IF;

  IF p_decision NOT IN ('verified', 'rejected') THEN
    RAISE EXCEPTION 'Keputusan verifikasi harus bernilai verified atau rejected.';
  END IF;

  IF p_decision = 'rejected' AND COALESCE(TRIM(p_rejection_reason), '') = '' THEN
    RAISE EXCEPTION 'Alasan penolakan wajib diisi saat menolak bukti pembayaran.';
  END IF;

  SELECT * INTO v_payment
  FROM public.payments
  WHERE id = p_payment_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Data pembayaran tidak ditemukan.';
  END IF;

  SELECT * INTO v_reservation
  FROM public.reservations
  WHERE id = v_payment.reservation_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF p_decision = 'verified' THEN
    UPDATE public.payments
    SET status = 'verified',
        verified_by = v_actor_id,
        verified_at = NOW(),
        rejection_reason = '',
        notes = COALESCE(NULLIF(TRIM(p_notes), ''), notes)
    WHERE id = v_payment.id
    RETURNING * INTO v_payment;

    UPDATE public.reservations
    SET status = 'confirmed',
        confirmed_at = NOW()
    WHERE id = v_reservation.id;

    UPDATE public.units
    SET status = 'reserved'
    WHERE id = v_reservation.unit_id;

    INSERT INTO public.notifications (user_id, type, title, message, reference_type, reference_id)
    VALUES (
      v_reservation.customer_id,
      'payment_verified',
      'Pembayaran Diverifikasi',
      'Selamat! Pembayaran untuk reservasi ' || v_reservation.reservation_number || ' telah diverifikasi dan reservasi Anda dikonfirmasi.',
      'reservation',
      v_reservation.id
    );
  ELSE
    UPDATE public.payments
    SET status = 'rejected',
        verified_by = v_actor_id,
        verified_at = NOW(),
        rejection_reason = TRIM(p_rejection_reason),
        notes = COALESCE(NULLIF(TRIM(p_notes), ''), notes)
    WHERE id = v_payment.id
    RETURNING * INTO v_payment;

    UPDATE public.reservations
    SET status = 'rejected',
        cancellation_reason = TRIM(p_rejection_reason)
    WHERE id = v_reservation.id;

    -- Buka kembali unit bila pembayaran ditolak
    UPDATE public.units
    SET status = 'available'
    WHERE id = v_reservation.unit_id
      AND status = 'reserved';

    INSERT INTO public.notifications (user_id, type, title, message, reference_type, reference_id)
    VALUES (
      v_reservation.customer_id,
      'payment_rejected',
      'Bukti Pembayaran Ditolak',
      'Pembayaran untuk reservasi ' || v_reservation.reservation_number || ' ditolak. Alasan: ' || TRIM(p_rejection_reason),
      'reservation',
      v_reservation.id
    );
  END IF;

  INSERT INTO public.activity_logs (
    actor_id,
    actor_role,
    action,
    entity_type,
    entity_id,
    summary,
    metadata
  ) VALUES (
    v_actor_id,
    public.current_user_role(),
    'payment.' || p_decision,
    'payment',
    v_payment.id,
    'Verifikasi pembayaran reservasi ' || v_reservation.reservation_number || ' -> ' || p_decision,
    jsonb_build_object('reservation_id', v_reservation.id, 'decision', p_decision, 'reason', p_rejection_reason)
  );

  RETURN v_payment;
END;
$$;
