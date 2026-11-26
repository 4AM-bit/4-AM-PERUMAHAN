-- ============================================================================
-- PERUMAHAN — Migration 0001: Core Schema, Enums, Constraints & Indexes
-- Platform Developer Properti & Sistem Manajemen Reservasi
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENUMS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('customer', 'sales', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.project_status AS ENUM ('launching', 'available', 'limited', 'sold_out');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.unit_status AS ENUM ('available', 'reserved', 'sold', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.reservation_status AS ENUM (
    'pending',
    'awaiting_verification',
    'confirmed',
    'rejected',
    'expired',
    'cancelled',
    'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM (
    'unpaid',
    'pending_verification',
    'verified',
    'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 2. UPDATED_AT TRIGGER HELPER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. TABLES (12 Core Tables + App Settings)
-- ----------------------------------------------------------------------------

-- 3.1 PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  nik TEXT CHECK (nik IS NULL OR nik = '' OR nik ~ '^[0-9]{16}$'),
  address TEXT DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3.2 PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT DEFAULT '',
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  full_description TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  gallery_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_units INTEGER NOT NULL DEFAULT 0 CHECK (total_units >= 0),
  starting_price NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (starting_price >= 0),
  status public.project_status NOT NULL DEFAULT 'available',
  land_area_range TEXT DEFAULT '',
  total_area_hectares TEXT DEFAULT '',
  completion_target TEXT DEFAULT '',
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  map_address TEXT DEFAULT '',
  map_lat DOUBLE PRECISION,
  map_lng DOUBLE PRECISION,
  nearby_access JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3.3 HOUSE TYPES
CREATE TABLE IF NOT EXISTS public.house_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
  booking_fee NUMERIC(15, 2) NOT NULL DEFAULT 5000000 CHECK (booking_fee >= 0),
  reservation_hold_hours INTEGER NOT NULL DEFAULT 24 CHECK (reservation_hold_hours BETWEEN 1 AND 168),
  land_area INTEGER NOT NULL CHECK (land_area > 0),
  building_area INTEGER NOT NULL CHECK (building_area > 0),
  bedrooms INTEGER NOT NULL DEFAULT 2 CHECK (bedrooms >= 1),
  bathrooms INTEGER NOT NULL DEFAULT 1 CHECK (bathrooms >= 1),
  floors INTEGER NOT NULL DEFAULT 1 CHECK (floors >= 1),
  carport INTEGER NOT NULL DEFAULT 1 CHECK (carport >= 0),
  short_description TEXT DEFAULT '',
  full_description TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  gallery_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  floorplan_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  building_specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3.4 UNITS
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  house_type_id UUID NOT NULL REFERENCES public.house_types(id) ON DELETE RESTRICT,
  unit_code TEXT NOT NULL,
  block TEXT NOT NULL DEFAULT '',
  price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
  land_area INTEGER NOT NULL CHECK (land_area > 0),
  building_area INTEGER NOT NULL CHECK (building_area > 0),
  facing TEXT DEFAULT '',
  status public.unit_status NOT NULL DEFAULT 'available',
  assigned_sales_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT uq_units_project_code UNIQUE (project_id, unit_code)
);

-- 3.5 PAYMENT ACCOUNTS (Rekening Developer)
CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  branch TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3.6 RESERVATIONS
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  house_type_id UUID NOT NULL REFERENCES public.house_types(id) ON DELETE RESTRICT,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE RESTRICT,
  assigned_sales_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_nik TEXT NOT NULL CHECK (customer_nik ~ '^[0-9]{16}$'),
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT DEFAULT '',
  unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
  booking_fee NUMERIC(15, 2) NOT NULL CHECK (booking_fee >= 0),
  status public.reservation_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Hard database-level anti-double-booking guarantee:
-- Only ONE active reservation can exist per unit at any instant.
CREATE UNIQUE INDEX IF NOT EXISTS uq_reservations_active_unit
  ON public.reservations (unit_id)
  WHERE status IN ('pending', 'awaiting_verification', 'confirmed')
    AND deleted_at IS NULL;

-- 3.7 PAYMENTS (Manual Bank Transfer + Verification)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  payment_account_id UUID REFERENCES public.payment_accounts(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  payment_date DATE,
  sender_bank TEXT DEFAULT '',
  sender_name TEXT DEFAULT '',
  proof_storage_path TEXT DEFAULT '',
  status public.payment_status NOT NULL DEFAULT 'unpaid',
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3.8 BANNERS
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  cta_label TEXT DEFAULT 'Jelajahi Rumah',
  cta_url TEXT DEFAULT '/katalog',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3.9 GALLERIES
CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Eksterior', 'Kawasan', 'Fasilitas', 'Interior')),
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3.10 FACILITIES
CREATE TABLE IF NOT EXISTS public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Umum',
  description TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'shield',
  highlight TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3.11 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_type TEXT DEFAULT '',
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.12 ACTIVITY LOGS (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role public.user_role,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  summary TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.13 APP SETTINGS (Configurable Reservation Expiry & Developer Info)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT DEFAULT '',
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_city ON public.projects(city) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_house_types_project ON public.house_types(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_units_project_status ON public.units(project_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_units_house_type ON public.units(house_type_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_units_sales ON public.units(assigned_sales_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON public.reservations(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_sales ON public.reservations(assigned_sales_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON public.reservations(expires_at) WHERE status = 'pending' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_reservation ON public.payments(reservation_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- ----------------------------------------------------------------------------
-- 5. ATTACH UPDATED_AT TRIGGERS
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles',
    'projects',
    'house_types',
    'units',
    'payment_accounts',
    'reservations',
    'payments',
    'banners',
    'galleries',
    'facilities',
    'notifications',
    'app_settings'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;', tbl, tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      tbl,
      tbl
    );
  END LOOP;
END $$;
