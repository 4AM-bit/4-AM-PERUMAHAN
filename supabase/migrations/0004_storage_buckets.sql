-- ============================================================================
-- PERUMAHAN — Migration 0004: Supabase Storage Buckets & Access Policies
-- 5 Public Media Buckets + 1 Private Bucket (payment-proofs) dengan Signed URL
-- ============================================================================

-- 1. Create Buckets (Idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'project-images',
    'project-images',
    TRUE,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'house-images',
    'house-images',
    TRUE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'house-floorplans',
    'house-floorplans',
    TRUE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf']
  ),
  (
    'gallery-images',
    'gallery-images',
    TRUE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'banners',
    'banners',
    TRUE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'payment-proofs',
    'payment-proofs',
    FALSE, -- PRIVATE BUCKET: hanya bisa diakses melalui Signed URL terotorisasi
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Public Buckets Read Policy
CREATE POLICY "public_media_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id IN (
      'project-images',
      'house-images',
      'house-floorplans',
      'gallery-images',
      'banners'
    )
  );

-- 3. Public Buckets Write/Delete Policy (Admin & Super Admin Only)
CREATE POLICY "public_media_admin_write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN (
      'project-images',
      'house-images',
      'house-floorplans',
      'gallery-images',
      'banners'
    )
    AND public.is_admin_or_above()
  );

CREATE POLICY "public_media_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN (
      'project-images',
      'house-images',
      'house-floorplans',
      'gallery-images',
      'banners'
    )
    AND public.is_admin_or_above()
  );

CREATE POLICY "public_media_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN (
      'project-images',
      'house-images',
      'house-floorplans',
      'gallery-images',
      'banners'
    )
    AND public.is_admin_or_above()
  );

-- 4. PRIVATE BUCKET: payment-proofs
-- Struktur path wajib: <customer_user_id>/<reservation_id>/<filename>
CREATE POLICY "payment_proofs_customer_upload_own_folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "payment_proofs_customer_read_own_folder"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "payment_proofs_admin_read_all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND public.is_admin_or_above()
  );
