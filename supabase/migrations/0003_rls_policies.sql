-- ============================================================================
-- PERUMAHAN — Migration 0003: Row Level Security (RLS) Policies
-- Matriks RBAC: Public (Anon), Customer, Sales, Admin, Super Admin
-- ============================================================================

-- Aktifkan RLS pada SELURUH tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- ----------------------------------------------------------------------------
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "profiles_select_admin_all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin_or_above());

CREATE POLICY "profiles_select_sales_assigned_customers"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'sales'
    AND role = 'customer'
    AND EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.customer_id = profiles.id
        AND r.assigned_sales_id = auth.uid()
        AND r.deleted_at IS NULL
    )
  );

CREATE POLICY "profiles_update_own_safe"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_manage_super_admin"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ----------------------------------------------------------------------------
-- 2. PROJECTS (Public read active; Admin/Super Admin full CRUD)
-- ----------------------------------------------------------------------------
CREATE POLICY "projects_public_read"
  ON public.projects FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "projects_admin_manage"
  ON public.projects FOR ALL
  TO authenticated
  USING (public.is_admin_or_above())
  WITH CHECK (public.is_admin_or_above());

-- ----------------------------------------------------------------------------
-- 3. HOUSE TYPES (Public read active; Admin/Super Admin full CRUD)
-- ----------------------------------------------------------------------------
CREATE POLICY "house_types_public_read"
  ON public.house_types FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "house_types_admin_manage"
  ON public.house_types FOR ALL
  TO authenticated
  USING (public.is_admin_or_above())
  WITH CHECK (public.is_admin_or_above());

-- ----------------------------------------------------------------------------
-- 4. UNITS (Public read active non-inactive; Staff read; Admin manage)
-- ----------------------------------------------------------------------------
CREATE POLICY "units_public_read"
  ON public.units FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL AND (status <> 'inactive' OR public.is_staff()));

CREATE POLICY "units_admin_manage"
  ON public.units FOR ALL
  TO authenticated
  USING (public.is_admin_or_above())
  WITH CHECK (public.is_admin_or_above());

-- ----------------------------------------------------------------------------
-- 5. PAYMENT ACCOUNTS (Authenticated read active; Admin manage)
-- ----------------------------------------------------------------------------
CREATE POLICY "payment_accounts_authenticated_read"
  ON public.payment_accounts FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL AND (is_active = TRUE OR public.is_admin_or_above()));

CREATE POLICY "payment_accounts_admin_manage"
  ON public.payment_accounts FOR ALL
  TO authenticated
  USING (public.is_admin_or_above())
  WITH CHECK (public.is_admin_or_above());

-- ----------------------------------------------------------------------------
-- 6. RESERVATIONS (Customer own; Sales assigned; Admin full)
-- ----------------------------------------------------------------------------
CREATE POLICY "reservations_customer_select_own"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "reservations_sales_select_assigned"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'sales'
    AND assigned_sales_id = auth.uid()
    AND deleted_at IS NULL
  );

CREATE POLICY "reservations_admin_all"
  ON public.reservations FOR ALL
  TO authenticated
  USING (public.is_admin_or_above())
  WITH CHECK (public.is_admin_or_above());

-- ----------------------------------------------------------------------------
-- 7. PAYMENTS (Customer own; Sales read assigned; Admin full)
-- ----------------------------------------------------------------------------
CREATE POLICY "payments_customer_select_own"
  ON public.payments FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "payments_sales_select_assigned"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    public.current_user_role() = 'sales'
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.reservations r
      WHERE r.id = payments.reservation_id
        AND r.assigned_sales_id = auth.uid()
        AND r.deleted_at IS NULL
    )
  );

CREATE POLICY "payments_admin_all"
  ON public.payments FOR ALL
  TO authenticated
  USING (public.is_admin_or_above())
  WITH CHECK (public.is_admin_or_above());

-- ----------------------------------------------------------------------------
-- 8. BANNERS, GALLERIES, FACILITIES (Public read active; Admin full)
-- ----------------------------------------------------------------------------
CREATE POLICY "banners_public_read"
  ON public.banners FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL AND (is_active = TRUE OR public.is_admin_or_above()));

CREATE POLICY "banners_admin_manage"
  ON public.banners FOR ALL
  TO authenticated
  USING (public.is_admin_or_above())
  WITH CHECK (public.is_admin_or_above());

CREATE POLICY "galleries_public_read"
  ON public.galleries FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL AND (is_active = TRUE OR public.is_admin_or_above()));

CREATE POLICY "galleries_admin_manage"
  ON public.galleries FOR ALL
  TO authenticated
  USING (public.is_admin_or_above())
  WITH CHECK (public.is_admin_or_above());

CREATE POLICY "facilities_public_read"
  ON public.facilities FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL AND (is_active = TRUE OR public.is_admin_or_above()));

CREATE POLICY "facilities_admin_manage"
  ON public.facilities FOR ALL
  TO authenticated
  USING (public.is_admin_or_above())
  WITH CHECK (public.is_admin_or_above());

-- ----------------------------------------------------------------------------
-- 9. NOTIFICATIONS (User own read/mark-read; Admin insert/read)
-- ----------------------------------------------------------------------------
CREATE POLICY "notifications_user_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_user_update_read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_admin_insert"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_above());

-- ----------------------------------------------------------------------------
-- 10. ACTIVITY LOGS (Admin/Super Admin read; Authenticated staff insert via app/RPC)
-- ----------------------------------------------------------------------------
CREATE POLICY "activity_logs_admin_select"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (public.is_admin_or_above());

CREATE POLICY "activity_logs_staff_insert"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff() AND actor_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 11. APP SETTINGS (Public read non-sensitive; Super Admin manage)
-- ----------------------------------------------------------------------------
CREATE POLICY "app_settings_public_read"
  ON public.app_settings FOR SELECT
  TO anon, authenticated
  USING (TRUE);

CREATE POLICY "app_settings_super_admin_manage"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
