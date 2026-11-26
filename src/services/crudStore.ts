import { IS_SUPABASE_CONFIGURED } from '@/lib/config'
import {
  DEMO_FACILITIES,
  DEMO_GALLERY,
  DEMO_HOUSE_TYPES,
  DEMO_PROJECTS,
} from '@/lib/demo-data'
import { SEEDED_DEMO_ACCOUNTS } from '@/services/authService'
import { supabase } from '@/supabase/client'
import type {
  ActivityLogRecord,
  BannerRecord,
  FacilityRecord,
  GalleryRecord,
  HouseTypeRecord,
  NotificationRecord,
  PaymentAccountRecord,
  PaymentRecord,
  ProfileRecord,
  ProjectRecord,
  ReservationRecord,
  UnitRecord,
} from '@/types/database'
import type { UserRole } from '@/types/auth'

export interface DemoDatabase {
  projects: ProjectRecord[]
  house_types: HouseTypeRecord[]
  units: UnitRecord[]
  profiles: ProfileRecord[]
  reservations: ReservationRecord[]
  payments: PaymentRecord[]
  payment_accounts: PaymentAccountRecord[]
  banners: BannerRecord[]
  galleries: GalleryRecord[]
  facilities: FacilityRecord[]
  notifications: NotificationRecord[]
  activity_logs: ActivityLogRecord[]
  settings: {
    reservationExpiryHours: number
    whatsappNumber: string
    supportEmail: string
    officeAddress: string
  }
}

export type CrudEntityKey =
  | 'projects'
  | 'house_types'
  | 'units'
  | 'profiles'
  | 'reservations'
  | 'payments'
  | 'payment_accounts'
  | 'banners'
  | 'galleries'
  | 'facilities'

const DEMO_DB_KEY = 'perumahan_demo_db_v1'

function isoHoursOffset(hours: number): string {
  return new Date(Date.now() + hours * 3600 * 1000).toISOString()
}

function buildInitialDemoDb(): DemoDatabase {
  const now = new Date().toISOString()

  const projects: ProjectRecord[] = DEMO_PROJECTS.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    location: p.location,
    city: p.city,
    description: p.description,
    full_description: p.fullDescription,
    cover_image_url: p.coverImage,
    gallery_urls: p.galleryImages,
    total_units: p.totalUnits,
    starting_price: p.startingPrice,
    status: p.status,
    land_area_range: p.landAreaRange,
    total_area_hectares: p.totalAreaHectares,
    completion_target: p.completionTarget,
    highlights: p.highlights,
    map_address: p.map.address,
    map_lat: p.map.lat,
    map_lng: p.map.lng,
    nearby_access: p.map.nearbyAccess,
    featured: p.featured,
    created_at: '2026-01-05T08:00:00.000Z',
    updated_at: now,
    deleted_at: null,
  }))

  const house_types: HouseTypeRecord[] = DEMO_HOUSE_TYPES.map((h) => ({
    id: h.id,
    project_id: h.projectId,
    slug: h.slug,
    name: h.name,
    category: h.category,
    price: h.price,
    booking_fee: h.bookingFee,
    reservation_hold_hours: h.reservationHoldHours,
    land_area: h.landArea,
    building_area: h.buildingArea,
    bedrooms: h.bedrooms,
    bathrooms: h.bathrooms,
    floors: h.floors,
    carport: h.carport,
    short_description: h.shortDescription,
    full_description: h.fullDescription,
    cover_image_url: h.coverImage,
    gallery_urls: h.galleryImages,
    floorplan_urls: [],
    specs: h.specs,
    building_specs: h.buildingSpecs,
    featured: h.featured,
    created_at: '2026-01-08T08:00:00.000Z',
    updated_at: now,
    deleted_at: null,
  }))

  const units: UnitRecord[] = DEMO_HOUSE_TYPES.flatMap((h) =>
    h.sampleUnits.map((u) => ({
      id: u.id,
      project_id: h.projectId,
      house_type_id: h.id,
      unit_code: u.unitCode,
      block: u.block,
      price: u.price,
      land_area: u.landArea,
      building_area: h.buildingArea,
      facing: u.facing,
      status: u.status,
      assigned_sales_id: 'demo-sales-001',
      notes: '',
      created_at: '2026-01-10T08:00:00.000Z',
      updated_at: now,
      deleted_at: null,
    })),
  )

  const seededProfiles: ProfileRecord[] = SEEDED_DEMO_ACCOUNTS.map((acc) => ({
    id: acc.profile.id,
    email: acc.profile.email,
    full_name: acc.profile.fullName,
    phone: acc.profile.phone,
    nik: acc.profile.nik || null,
    address: acc.profile.address,
    role: acc.profile.role,
    is_active: acc.profile.isActive,
    created_at: acc.profile.createdAt,
    updated_at: acc.profile.updatedAt,
    deleted_at: null,
  }))

  const extraCustomers: ProfileRecord[] = [
    {
      id: 'demo-customer-002',
      email: 'clarissa.wijaya@email.com',
      full_name: 'dr. Clarissa Wijaya',
      phone: '081388112233',
      nik: '3174055408900002',
      address: 'Jl. Kemang Selatan VIII No. 14, Jakarta Selatan',
      role: 'customer',
      is_active: true,
      created_at: '2026-02-12T09:15:00.000Z',
      updated_at: '2026-02-12T09:15:00.000Z',
      deleted_at: null,
    },
    {
      id: 'demo-customer-003',
      email: 'rendra.pratama@email.com',
      full_name: 'Rendra Pratama',
      phone: '081799223344',
      nik: '3276021903940007',
      address: 'Jl. Margonda Raya No. 88, Depok',
      role: 'customer',
      is_active: true,
      created_at: '2026-03-04T11:30:00.000Z',
      updated_at: '2026-03-04T11:30:00.000Z',
      deleted_at: null,
    },
    {
      id: 'demo-customer-004',
      email: 'sinta.rahmawati@email.com',
      full_name: 'Sinta Rahmawati',
      phone: '081277665544',
      nik: '3671096107910001',
      address: 'Cluster Griya Loka Blok F2, BSD City',
      role: 'customer',
      is_active: true,
      created_at: '2026-04-18T14:20:00.000Z',
      updated_at: '2026-04-18T14:20:00.000Z',
      deleted_at: null,
    },
  ]

  const payment_accounts: PaymentAccountRecord[] = [
    {
      id: 'pa-bca-01',
      bank_name: 'Bank Central Asia (BCA)',
      account_number: '6880452190',
      account_holder: 'PT Perumahan Nusantara Properti',
      branch: 'KCU BSD City',
      instructions: 'Cantumkan nomor reservasi pada berita transfer.',
      is_active: true,
      display_order: 1,
      created_at: '2026-01-01T08:00:00.000Z',
      updated_at: now,
      deleted_at: null,
    },
    {
      id: 'pa-mandiri-02',
      bank_name: 'Bank Mandiri',
      account_number: '1280009451120',
      account_holder: 'PT Perumahan Nusantara Properti',
      branch: 'KC Tangerang Selatan',
      instructions: 'Transfer sesuai nominal booking fee dan unggah struk bukti transfer.',
      is_active: true,
      display_order: 2,
      created_at: '2026-01-01T08:00:00.000Z',
      updated_at: now,
      deleted_at: null,
    },
    {
      id: 'pa-bsi-03',
      bank_name: 'Bank Syariah Indonesia (BSI)',
      account_number: '7198450023',
      account_holder: 'PT Perumahan Nusantara Properti',
      branch: 'KC Serpong',
      instructions: 'Tersedia untuk transaksi pembiayaan syariah maupun tunai bertahap.',
      is_active: true,
      display_order: 3,
      created_at: '2026-01-01T08:00:00.000Z',
      updated_at: now,
      deleted_at: null,
    },
  ]

  const reservations: ReservationRecord[] = [
    {
      id: 'rsv-demo-001',
      reservation_number: 'RSV-20261124-1001',
      customer_id: 'demo-customer-001',
      project_id: 'proj-canopy-cibubur',
      house_type_id: 'ht-akasia-45',
      unit_id: 'u-ak-b01',
      assigned_sales_id: 'demo-sales-001',
      customer_name: 'Arif Budiman',
      customer_nik: '3674011205920004',
      customer_phone: '081234567890',
      customer_email: 'pelanggan@perumahan.co.id',
      customer_address: 'Jl. Melati Indah No. 12, Serpong, Tangerang Selatan',
      unit_price: 895000000,
      booking_fee: 5000000,
      status: 'awaiting_verification',
      expires_at: isoHoursOffset(18),
      confirmed_at: null,
      cancelled_at: null,
      cancellation_reason: '',
      notes: 'Rencana skema KPR Bank Syariah 15 tahun.',
      created_at: isoHoursOffset(-6),
      updated_at: isoHoursOffset(-2),
      deleted_at: null,
    },
    {
      id: 'rsv-demo-002',
      reservation_number: 'RSV-20261120-1002',
      customer_id: 'demo-customer-002',
      project_id: 'proj-verdant-sentul',
      house_type_id: 'ht-meranti-82',
      unit_id: 'u-mr-d06',
      assigned_sales_id: 'demo-sales-001',
      customer_name: 'dr. Clarissa Wijaya',
      customer_nik: '3174055408900002',
      customer_phone: '081388112233',
      customer_email: 'clarissa.wijaya@email.com',
      customer_address: 'Jl. Kemang Selatan VIII No. 14, Jakarta Selatan',
      unit_price: 1750000000,
      booking_fee: 10000000,
      status: 'confirmed',
      expires_at: isoHoursOffset(-24),
      confirmed_at: isoHoursOffset(-36),
      cancelled_at: null,
      cancellation_reason: '',
      notes: 'Booking fee sudah lunas, jadwal akad minggu depan.',
      created_at: isoHoursOffset(-72),
      updated_at: isoHoursOffset(-36),
      deleted_at: null,
    },
    {
      id: 'rsv-demo-003',
      reservation_number: 'RSV-20261115-1003',
      customer_id: 'demo-customer-003',
      project_id: 'proj-serenity-bsd',
      house_type_id: 'ht-cendana-68',
      unit_id: 'u-cn-b14',
      assigned_sales_id: 'demo-sales-001',
      customer_name: 'Rendra Pratama',
      customer_nik: '3276021903940007',
      customer_phone: '081799223344',
      customer_email: 'rendra.pratama@email.com',
      customer_address: 'Jl. Margonda Raya No. 88, Depok',
      unit_price: 1380000000,
      booking_fee: 10000000,
      status: 'completed',
      expires_at: isoHoursOffset(-120),
      confirmed_at: isoHoursOffset(-140),
      cancelled_at: null,
      cancellation_reason: '',
      notes: 'Akad PPJB selesai.',
      created_at: isoHoursOffset(-200),
      updated_at: isoHoursOffset(-100),
      deleted_at: null,
    },
    {
      id: 'rsv-demo-004',
      reservation_number: 'RSV-20261125-1004',
      customer_id: 'demo-customer-004',
      project_id: 'proj-serenity-bsd',
      house_type_id: 'ht-eboni-128',
      unit_id: 'u-eb-v05',
      assigned_sales_id: 'demo-sales-001',
      customer_name: 'Sinta Rahmawati',
      customer_nik: '3671096107910001',
      customer_phone: '081277665544',
      customer_email: 'sinta.rahmawati@email.com',
      customer_address: 'Cluster Griya Loka Blok F2, BSD City',
      unit_price: 2650000000,
      booking_fee: 20000000,
      status: 'pending',
      expires_at: isoHoursOffset(20),
      confirmed_at: null,
      cancelled_at: null,
      cancellation_reason: '',
      notes: 'Menunggu transfer booking fee dari pelanggan.',
      created_at: isoHoursOffset(-4),
      updated_at: isoHoursOffset(-4),
      deleted_at: null,
    },
  ]

  const payments: PaymentRecord[] = [
    {
      id: 'pay-demo-001',
      reservation_id: 'rsv-demo-001',
      customer_id: 'demo-customer-001',
      payment_account_id: 'pa-bca-01',
      amount: 5000000,
      payment_date: now.slice(0, 10),
      sender_bank: 'BCA',
      sender_name: 'Arif Budiman',
      proof_storage_path: '/images/hero-residence.jpg',
      status: 'pending_verification',
      verified_by: null,
      verified_at: null,
      rejection_reason: '',
      notes: 'Transfer via m-BCA berita RSV-20261124-1001',
      created_at: isoHoursOffset(-6),
      updated_at: isoHoursOffset(-2),
      deleted_at: null,
    },
    {
      id: 'pay-demo-002',
      reservation_id: 'rsv-demo-002',
      customer_id: 'demo-customer-002',
      payment_account_id: 'pa-mandiri-02',
      amount: 10000000,
      payment_date: '2026-11-21',
      sender_bank: 'Bank Mandiri',
      sender_name: 'Clarissa Wijaya',
      proof_storage_path: '/images/project-cluster-2.jpg',
      status: 'verified',
      verified_by: 'demo-admin-001',
      verified_at: isoHoursOffset(-36),
      rejection_reason: '',
      notes: 'Mutasi rekening terverifikasi sesuai nominal.',
      created_at: isoHoursOffset(-70),
      updated_at: isoHoursOffset(-36),
      deleted_at: null,
    },
    {
      id: 'pay-demo-003',
      reservation_id: 'rsv-demo-003',
      customer_id: 'demo-customer-003',
      payment_account_id: 'pa-bca-01',
      amount: 10000000,
      payment_date: '2026-11-16',
      sender_bank: 'BCA',
      sender_name: 'Rendra Pratama',
      proof_storage_path: '/images/project-cluster-1.jpg',
      status: 'verified',
      verified_by: 'demo-admin-001',
      verified_at: isoHoursOffset(-140),
      rejection_reason: '',
      notes: 'Pembayaran booking fee valid.',
      created_at: isoHoursOffset(-190),
      updated_at: isoHoursOffset(-140),
      deleted_at: null,
    },
    {
      id: 'pay-demo-004',
      reservation_id: 'rsv-demo-004',
      customer_id: 'demo-customer-004',
      payment_account_id: null,
      amount: 20000000,
      payment_date: null,
      sender_bank: '',
      sender_name: '',
      proof_storage_path: '',
      status: 'unpaid',
      verified_by: null,
      verified_at: null,
      rejection_reason: '',
      notes: '',
      created_at: isoHoursOffset(-4),
      updated_at: isoHoursOffset(-4),
      deleted_at: null,
    },
  ]

  const banners: BannerRecord[] = [
    {
      id: 'bnr-01',
      title: 'Temukan Hunian Impian Anda',
      subtitle: 'Koleksi hunian tropis modern dengan legalitas SHM & reservasi online terkunci.',
      image_url: '/images/hero-residence.jpg',
      cta_label: 'Jelajahi Rumah',
      cta_url: '/katalog',
      display_order: 1,
      is_active: true,
      created_at: '2026-01-05T08:00:00.000Z',
      updated_at: now,
      deleted_at: null,
    },
    {
      id: 'bnr-02',
      title: 'Launching Tahap 1 — The Canopy Park Cibubur',
      subtitle: '8 menit menuju Stasiun LRT Harjamukti, harga perdana mulai Rp 895 Juta.',
      image_url: '/images/house-type-compact.jpg',
      cta_label: 'Lihat Proyek',
      cta_url: '/proyek/the-canopy-park',
      display_order: 2,
      is_active: true,
      created_at: '2026-02-01T08:00:00.000Z',
      updated_at: now,
      deleted_at: null,
    },
  ]

  const galleries: GalleryRecord[] = DEMO_GALLERY.map((g, idx) => ({
    id: g.id,
    project_id: projects[idx % projects.length]?.id ?? null,
    title: g.title,
    category: g.category,
    image_url: g.imageUrl,
    caption: g.caption,
    display_order: idx + 1,
    is_active: true,
    created_at: '2026-01-12T08:00:00.000Z',
    updated_at: now,
    deleted_at: null,
  }))

  const facilities: FacilityRecord[] = DEMO_FACILITIES.map((f, idx) => ({
    id: f.id,
    project_id: null,
    title: f.title,
    category: f.category,
    description: f.description,
    icon_name: f.iconName,
    highlight: f.highlight,
    display_order: idx + 1,
    is_active: true,
    created_at: '2026-01-12T08:00:00.000Z',
    updated_at: now,
    deleted_at: null,
  }))

  const notifications: NotificationRecord[] = [
    {
      id: 'notif-01',
      user_id: 'demo-customer-001',
      type: 'payment_submitted',
      title: 'Bukti Pembayaran Diterima',
      message:
        'Bukti transfer untuk reservasi RSV-20261124-1001 telah diterima dan sedang menunggu verifikasi administrator.',
      reference_type: 'reservation',
      reference_id: 'rsv-demo-001',
      is_read: false,
      read_at: null,
      created_at: isoHoursOffset(-2),
      updated_at: isoHoursOffset(-2),
    },
    {
      id: 'notif-02',
      user_id: 'demo-customer-001',
      type: 'reservation_created',
      title: 'Reservasi Unit CP-B01 Berhasil Dibuat',
      message:
        'Unit CP-B01 dikunci sementara selama 24 jam. Lakukan transfer booking fee Rp 5.000.000 ke rekening resmi developer.',
      reference_type: 'reservation',
      reference_id: 'rsv-demo-001',
      is_read: true,
      read_at: isoHoursOffset(-5),
      created_at: isoHoursOffset(-6),
      updated_at: isoHoursOffset(-5),
    },
  ]

  const activity_logs: ActivityLogRecord[] = [
    {
      id: 'log-01',
      actor_id: 'demo-admin-001',
      actor_role: 'admin',
      action: 'payment.verified',
      entity_type: 'payment',
      entity_id: 'pay-demo-002',
      summary: 'Memverifikasi pembayaran booking fee RSV-20261120-1002 (dr. Clarissa Wijaya)',
      metadata: { amount: 10000000 },
      created_at: isoHoursOffset(-36),
    },
    {
      id: 'log-02',
      actor_id: 'demo-customer-001',
      actor_role: 'customer',
      action: 'payment.submitted',
      entity_type: 'payment',
      entity_id: 'pay-demo-001',
      summary: 'Mengunggah bukti transfer bank BCA untuk RSV-20261124-1001',
      metadata: { amount: 5000000 },
      created_at: isoHoursOffset(-2),
    },
    {
      id: 'log-03',
      actor_id: 'demo-superadmin-001',
      actor_role: 'super_admin',
      action: 'settings.updated',
      entity_type: 'app_settings',
      entity_id: null,
      summary: 'Menetapkan masa berlaku penguncian reservasi default 24 jam',
      metadata: { hours: 24 },
      created_at: isoHoursOffset(-96),
    },
  ]

  return {
    projects,
    house_types,
    units,
    profiles: [...seededProfiles, ...extraCustomers],
    reservations,
    payments,
    payment_accounts,
    banners,
    galleries,
    facilities,
    notifications,
    activity_logs,
    settings: {
      reservationExpiryHours: 24,
      whatsappNumber: '6281294008800',
      supportEmail: 'halo@perumahan.co.id',
      officeAddress:
        'Marketing Gallery PERUMAHAN, Jl. Boulevard Hijau Kav. 18, BSD City, Tangerang Selatan 15345',
    },
  }
}

export function loadDemoDb(): DemoDatabase {
  try {
    const raw = localStorage.getItem(DEMO_DB_KEY)
    if (!raw) {
      const seeded = buildInitialDemoDb()
      localStorage.setItem(DEMO_DB_KEY, JSON.stringify(seeded))
      return seeded
    }
    return JSON.parse(raw) as DemoDatabase
  } catch {
    return buildInitialDemoDb()
  }
}

export function saveDemoDb(db: DemoDatabase): void {
  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(db))
}

export function appendDemoActivityLog(
  db: DemoDatabase,
  entry: {
    actorId: string | null
    actorRole: UserRole | null
    action: string
    entityType: string
    entityId: string | null
    summary: string
    metadata?: Record<string, unknown>
  },
): void {
  db.activity_logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actor_id: entry.actorId,
    actor_role: entry.actorRole,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId,
    summary: entry.summary,
    metadata: entry.metadata ?? {},
    created_at: new Date().toISOString(),
  })
}

export interface ActorContext {
  id: string
  role: UserRole
  fullName?: string
}

const SOFT_DELETE_TABLES: ReadonlySet<CrudEntityKey> = new Set([
  'profiles',
  'projects',
  'house_types',
  'units',
  'payment_accounts',
  'reservations',
  'payments',
])

function fromLiveRow(table: CrudEntityKey, raw: Record<string, unknown>): Record<string, unknown> {
  if (table === 'profiles') {
    return {
      ...raw,
      nik: raw.identity_number ?? null,
    }
  }
  if (table === 'projects') {
    const status = raw.status === 'selling' ? 'available' : raw.status
    return {
      ...raw,
      status,
      featured: Boolean(raw.is_featured),
      full_description: raw.description ?? '',
      gallery_urls: raw.cover_image_url ? [raw.cover_image_url] : [],
      land_area_range: raw.land_area_total ?? '',
      total_area_hectares: raw.land_area_total ?? '',
      completion_target: raw.handover_estimate ?? '',
      map_address: raw.address ?? '',
      map_lat: null,
      map_lng: null,
      nearby_access: [],
    }
  }
  if (table === 'house_types') {
    return {
      ...raw,
      reservation_hold_hours: 24,
      short_description: raw.description ?? '',
      full_description: raw.description ?? '',
      gallery_urls: raw.cover_image_url ? [raw.cover_image_url] : [],
      floorplan_urls: raw.floorplan_image_url ? [raw.floorplan_image_url] : [],
      specs: Array.isArray(raw.features) ? raw.features : [],
      building_specs: Array.isArray(raw.specifications) ? raw.specifications : [],
      featured: Boolean(raw.is_featured),
    }
  }
  if (table === 'units') {
    return {
      ...raw,
      unit_code: raw.unit_number ?? '',
      assigned_sales_id: null,
      notes: raw.notes ?? '',
    }
  }
  if (table === 'reservations') {
    return {
      ...raw,
      customer_name: raw.customer_full_name ?? '',
      customer_nik: raw.customer_identity_number ?? '',
      booking_fee: Number(raw.booking_fee_amount ?? 0),
      unit_price: Number(raw.unit_price ?? 0),
      cancellation_reason: raw.cancellation_reason ?? '',
      notes: raw.notes ?? '',
    }
  }
  if (table === 'payments') {
    return {
      ...raw,
      amount: Number(raw.amount ?? 0),
      payment_date:
        typeof raw.payment_date === 'string' ? raw.payment_date.slice(0, 10) : null,
      sender_bank: raw.sender_bank ?? '',
      sender_name: raw.sender_name ?? '',
      proof_storage_path: raw.proof_storage_path ?? '',
      rejection_reason: raw.rejection_reason ?? '',
      notes: raw.notes ?? '',
    }
  }
  if (table === 'galleries') {
    return {
      ...raw,
      caption: '',
      is_active: true,
      deleted_at: null,
    }
  }
  if (table === 'facilities') {
    return {
      ...raw,
      highlight: '',
      deleted_at: null,
    }
  }
  if (table === 'banners') {
    return {
      ...raw,
      deleted_at: null,
    }
  }
  return raw
}

function toLivePayload(
  table: CrudEntityKey,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  if (table === 'profiles') {
    return {
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone ?? '',
      identity_number: payload.nik ?? null,
      address: payload.address ?? '',
      role: payload.role,
      is_active: payload.is_active ?? true,
    }
  }
  if (table === 'projects') {
    const status = payload.status === 'available' ? 'selling' : payload.status
    return {
      slug: payload.slug,
      name: payload.name,
      tagline: payload.tagline ?? '',
      location: payload.location,
      city: payload.city,
      address: payload.map_address ?? payload.location ?? '',
      description: payload.description ?? '',
      total_units: Number(payload.total_units ?? 0),
      starting_price: Number(payload.starting_price ?? 0),
      status,
      land_area_total: payload.land_area_range ?? '',
      handover_estimate: payload.completion_target ?? '',
      cover_image_url: payload.cover_image_url ?? '',
      highlights: payload.highlights ?? [],
      is_featured: Boolean(payload.featured),
    }
  }
  if (table === 'house_types') {
    return {
      project_id: payload.project_id,
      slug: payload.slug,
      name: payload.name,
      category: payload.category ?? 'Signature Living',
      price: Number(payload.price ?? 0),
      booking_fee: Number(payload.booking_fee ?? 5000000),
      land_area: Number(payload.land_area ?? 72),
      building_area: Number(payload.building_area ?? 45),
      bedrooms: Number(payload.bedrooms ?? 2),
      bathrooms: Number(payload.bathrooms ?? 1),
      floors: Number(payload.floors ?? 1),
      carport: Number(payload.carport ?? 1),
      description: payload.short_description ?? '',
      cover_image_url: payload.cover_image_url ?? '',
      features: payload.specs ?? [],
      specifications: payload.building_specs ?? [],
      is_featured: Boolean(payload.featured),
    }
  }
  if (table === 'units') {
    return {
      project_id: payload.project_id,
      house_type_id: payload.house_type_id,
      unit_number: payload.unit_code,
      block: payload.block ?? '',
      price: Number(payload.price ?? 0),
      land_area: Number(payload.land_area ?? 72),
      building_area: Number(payload.building_area ?? 45),
      facing: payload.facing ?? 'Utara',
      status: payload.status ?? 'available',
      notes: payload.notes ?? '',
    }
  }
  if (table === 'reservations') {
    return {
      reservation_number: payload.reservation_number,
      customer_id: payload.customer_id,
      project_id: payload.project_id,
      house_type_id: payload.house_type_id,
      unit_id: payload.unit_id,
      assigned_sales_id: payload.assigned_sales_id ?? null,
      customer_full_name: payload.customer_name,
      customer_email: payload.customer_email,
      customer_phone: payload.customer_phone,
      customer_identity_number: payload.customer_nik,
      customer_address: payload.customer_address ?? '',
      unit_price: Number(payload.unit_price ?? 0),
      booking_fee_amount: Number(payload.booking_fee ?? 0),
      status: payload.status,
      expires_at: payload.expires_at,
      confirmed_at: payload.confirmed_at ?? null,
      cancelled_at: payload.cancelled_at ?? null,
      cancellation_reason: payload.cancellation_reason ?? null,
      notes: payload.notes ?? null,
    }
  }
  if (table === 'payments') {
    return {
      reservation_id: payload.reservation_id,
      customer_id: payload.customer_id,
      payment_account_id: payload.payment_account_id ?? null,
      amount: Number(payload.amount ?? 0),
      payment_date: payload.payment_date || null,
      sender_bank: payload.sender_bank || null,
      sender_name: payload.sender_name || null,
      proof_storage_path: payload.proof_storage_path || null,
      status: payload.status,
      verified_by: payload.verified_by ?? null,
      verified_at: payload.verified_at ?? null,
      rejection_reason: payload.rejection_reason || null,
      notes: payload.notes || null,
    }
  }
  if (table === 'galleries') {
    return {
      project_id: payload.project_id ?? null,
      title: payload.title,
      category: payload.category,
      image_url: payload.image_url,
      is_featured: Boolean(payload.is_active ?? true),
      display_order: Number(payload.display_order ?? 0),
    }
  }
  if (table === 'facilities') {
    return {
      project_id: payload.project_id ?? null,
      title: payload.title,
      category: payload.category ?? 'Umum',
      description: payload.description ?? '',
      icon_name: payload.icon_name ?? 'shield',
      display_order: Number(payload.display_order ?? 0),
      is_active: Boolean(payload.is_active ?? true),
    }
  }
  if (table === 'banners') {
    return {
      title: payload.title,
      subtitle: payload.subtitle ?? '',
      image_url: payload.image_url,
      cta_label: payload.cta_label ?? 'Jelajahi Rumah',
      cta_url: payload.cta_url ?? '/katalog',
      display_order: Number(payload.display_order ?? 0),
      is_active: Boolean(payload.is_active ?? true),
    }
  }
  return payload
}

export const crudService = {
  async list<T extends { id: string; deleted_at?: string | null }>(
    table: CrudEntityKey,
  ): Promise<T[]> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      let query = supabase.from(table).select('*')
      if (SOFT_DELETE_TABLES.has(table)) {
        query = query.is('deleted_at', null)
      }
      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Gagal memuat data ${table}: ${error.message}`)
      }
      return (data ?? []).map((row) =>
        fromLiveRow(table, row as Record<string, unknown>),
      ) as unknown as T[]
    }

    await new Promise((resolve) => setTimeout(resolve, 160))
    const db = loadDemoDb()
    const rows = (db[table] as unknown as T[]).filter((row) => !row.deleted_at)
    return rows
  },

  async create<T extends { id: string }>(
    table: CrudEntityKey,
    payload: Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
    actor: ActorContext,
    summaryLabel: string,
  ): Promise<T> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const livePayload = toLivePayload(table, payload as Record<string, unknown>)
      const { data, error } = await supabase
        .from(table)
        .insert(livePayload)
        .select('*')
        .single()

      if (error || !data) {
        throw new Error(`Gagal menambah data ${table}: ${error?.message ?? 'Unknown error'}`)
      }

      const mapped = fromLiveRow(table, data as Record<string, unknown>) as unknown as T
      await supabase.from('activity_logs').insert({
        actor_id: actor.id,
        actor_role: actor.role,
        action: `${table}.created`,
        entity_type: table,
        entity_id: mapped.id,
        metadata: { summary: `Menambahkan ${summaryLabel}` },
      })

      return mapped
    }

    await new Promise((resolve) => setTimeout(resolve, 220))
    const db = loadDemoDb()
    const now = new Date().toISOString()
    const created = {
      ...payload,
      id: `${table.slice(0, 4)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    } as unknown as T

    ;(db[table] as unknown as T[]).unshift(created)
    appendDemoActivityLog(db, {
      actorId: actor.id,
      actorRole: actor.role,
      action: `${table}.created`,
      entityType: table,
      entityId: created.id,
      summary: `Menambahkan ${summaryLabel}`,
    })
    saveDemoDb(db)
    return created
  },

  async update<T extends { id: string }>(
    table: CrudEntityKey,
    id: string,
    patch: Partial<T>,
    actor: ActorContext,
    summaryLabel: string,
  ): Promise<T> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const livePatch = toLivePayload(table, patch as Record<string, unknown>)
      const { data, error } = await supabase
        .from(table)
        .update({
          ...livePatch,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single()

      if (error || !data) {
        throw new Error(`Gagal memperbarui data ${table}: ${error?.message ?? 'Unknown error'}`)
      }

      await supabase.from('activity_logs').insert({
        actor_id: actor.id,
        actor_role: actor.role,
        action: `${table}.updated`,
        entity_type: table,
        entity_id: id,
        metadata: { summary: `Memperbarui ${summaryLabel}` },
      })

      return fromLiveRow(table, data as Record<string, unknown>) as unknown as T
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
    const db = loadDemoDb()
    const rows = db[table] as unknown as T[]
    const idx = rows.findIndex((row) => row.id === id)
    if (idx === -1) {
      throw new Error('Data tidak ditemukan.')
    }

    const updated = {
      ...rows[idx],
      ...patch,
      updated_at: new Date().toISOString(),
    } as T
    rows[idx] = updated

    appendDemoActivityLog(db, {
      actorId: actor.id,
      actorRole: actor.role,
      action: `${table}.updated`,
      entityType: table,
      entityId: id,
      summary: `Memperbarui ${summaryLabel}`,
    })
    saveDemoDb(db)
    return updated
  },

  /**
   * Soft delete pada seluruh entitas penting.
   * Memblokir penghapusan reservasi terkonfirmasi dan pembayaran terverifikasi.
   */
  async softDelete(
    table: CrudEntityKey,
    id: string,
    actor: ActorContext,
    summaryLabel: string,
  ): Promise<void> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const query = SOFT_DELETE_TABLES.has(table)
        ? supabase.from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id)
        : supabase.from(table).delete().eq('id', id)

      const { error } = await query
      if (error) {
        throw new Error(error.message)
      }

      await supabase.from('activity_logs').insert({
        actor_id: actor.id,
        actor_role: actor.role,
        action: `${table}.deleted`,
        entity_type: table,
        entity_id: id,
        metadata: { summary: `Menghapus ${summaryLabel}` },
      })
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
    const db = loadDemoDb()

    if (table === 'reservations') {
      const target = db.reservations.find((r) => r.id === id)
      if (target && (target.status === 'confirmed' || target.status === 'completed')) {
        throw new Error(
          'Transaksi reservasi yang sudah dikonfirmasi atau selesai tidak boleh dihapus.',
        )
      }
    }

    if (table === 'payments') {
      const target = db.payments.find((p) => p.id === id)
      if (target && target.status === 'verified') {
        throw new Error('Pembayaran yang sudah terverifikasi tidak boleh dihapus.')
      }
    }

    if (table === 'profiles' && id === actor.id) {
      throw new Error('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.')
    }

    const rows = db[table] as Array<{ id: string; deleted_at?: string | null }>
    const target = rows.find((row) => row.id === id)
    if (!target) {
      throw new Error('Data tidak ditemukan.')
    }

    target.deleted_at = new Date().toISOString()
    appendDemoActivityLog(db, {
      actorId: actor.id,
      actorRole: actor.role,
      action: `${table}.deleted`,
      entityType: table,
      entityId: id,
      summary: `Menghapus (soft delete) ${summaryLabel}`,
    })
    saveDemoDb(db)
  },
}
