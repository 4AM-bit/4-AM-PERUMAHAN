import type { UserRole } from '@/types/auth'
import type { ProjectStatus, UnitStatus } from '@/types/property'

export type ReservationStatus =
  | 'pending'
  | 'awaiting_verification'
  | 'confirmed'
  | 'rejected'
  | 'expired'
  | 'cancelled'
  | 'completed'

export type PaymentStatus =
  | 'unpaid'
  | 'pending_verification'
  | 'verified'
  | 'rejected'

export type StorageBucket =
  | 'project-images'
  | 'house-images'
  | 'house-floorplans'
  | 'gallery-images'
  | 'banners'
  | 'payment-proofs'

export interface ProfileRecord {
  id: string
  email: string
  full_name: string
  phone: string
  nik: string | null
  address: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ProjectRecord {
  id: string
  slug: string
  name: string
  tagline: string
  location: string
  city: string
  description: string
  full_description: string
  cover_image_url: string
  gallery_urls: string[]
  total_units: number
  starting_price: number
  status: ProjectStatus
  land_area_range: string
  total_area_hectares: string
  completion_target: string
  highlights: string[]
  map_address: string
  map_lat: number | null
  map_lng: number | null
  nearby_access: string[]
  featured: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface HouseTypeRecord {
  id: string
  project_id: string
  slug: string
  name: string
  category: string
  price: number
  booking_fee: number
  reservation_hold_hours: number
  land_area: number
  building_area: number
  bedrooms: number
  bathrooms: number
  floors: number
  carport: number
  short_description: string
  full_description: string
  cover_image_url: string
  gallery_urls: string[]
  floorplan_urls: string[]
  specs: string[]
  building_specs: Array<{ label: string; value: string }>
  featured: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface UnitRecord {
  id: string
  project_id: string
  house_type_id: string
  unit_code: string
  block: string
  price: number
  land_area: number
  building_area: number
  facing: string
  status: UnitStatus
  assigned_sales_id: string | null
  notes: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PaymentAccountRecord {
  id: string
  bank_name: string
  account_number: string
  account_holder: string
  branch: string
  instructions: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ReservationRecord {
  id: string
  reservation_number: string
  customer_id: string
  project_id: string
  house_type_id: string
  unit_id: string
  assigned_sales_id: string | null
  customer_name: string
  customer_nik: string
  customer_phone: string
  customer_email: string
  customer_address: string
  unit_price: number
  booking_fee: number
  status: ReservationStatus
  expires_at: string
  confirmed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string
  notes: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PaymentRecord {
  id: string
  reservation_id: string
  customer_id: string
  payment_account_id: string | null
  amount: number
  payment_date: string | null
  sender_bank: string
  sender_name: string
  proof_storage_path: string
  status: PaymentStatus
  verified_by: string | null
  verified_at: string | null
  rejection_reason: string
  notes: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface BannerRecord {
  id: string
  title: string
  subtitle: string
  image_url: string
  cta_label: string
  cta_url: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface GalleryRecord {
  id: string
  project_id: string | null
  title: string
  category: 'Eksterior' | 'Kawasan' | 'Fasilitas' | 'Interior'
  image_url: string
  caption: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface FacilityRecord {
  id: string
  project_id: string | null
  title: string
  category: string
  description: string
  icon_name: 'shield' | 'trees' | 'waves' | 'wifi' | 'building' | 'zap'
  highlight: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface NotificationRecord {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  reference_type: string
  reference_id: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface ActivityLogRecord {
  id: string
  actor_id: string | null
  actor_role: UserRole | null
  action: string
  entity_type: string
  entity_id: string | null
  summary: string
  metadata: Record<string, unknown>
  created_at: string
}
