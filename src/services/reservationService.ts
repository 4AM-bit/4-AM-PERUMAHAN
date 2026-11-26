import { IS_SUPABASE_CONFIGURED } from '@/lib/config'
import {
  appendDemoActivityLog,
  crudService,
  loadDemoDb,
  saveDemoDb,
} from '@/services/crudStore'
import { supabase } from '@/supabase/client'
import type {
  HouseTypeRecord,
  PaymentAccountRecord,
  PaymentRecord,
  ProjectRecord,
  ReservationRecord,
  UnitRecord,
} from '@/types/database'

export interface ReservationCatalogData {
  projects: ProjectRecord[]
  houseTypes: HouseTypeRecord[]
  units: UnitRecord[]
  paymentAccounts: PaymentAccountRecord[]
  expiryHours: number
}

export interface CreateReservationPayload {
  unitId: string
  customerFullName: string
  customerEmail: string
  customerPhone: string
  customerIdentityNumber: string
  customerAddress: string
  notes?: string
}

export interface EnrichedReservation extends ReservationRecord {
  projectName: string
  projectLocation: string
  houseTypeName: string
  unitCode: string
  unitBlock: string
  payment: PaymentRecord | null
}

export interface CreatedReservationResult {
  reservationId: string
  reservationNumber: string
  unitCode: string
  projectName: string
  houseTypeName: string
  unitPrice: number
  bookingFee: number
  expiresAt: string
  status: ReservationRecord['status']
}

export const reservationService = {
  async getExpiryHours(): Promise<number> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'reservation_expiry_hours')
        .maybeSingle<{ value: { hours?: number } }>()
      return Number(data?.value?.hours ?? 24)
    }
    return loadDemoDb().settings.reservationExpiryHours || 24
  },

  async getReservationCatalog(): Promise<ReservationCatalogData> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      // Lepaskan reservasi kedaluwarsa terlebih dahulu jika pengguna terautentikasi
      await supabase.rpc('expire_overdue_reservations')
    }

    const [projects, houseTypes, units, paymentAccounts, expiryHours] =
      await Promise.all([
        crudService.list<ProjectRecord>('projects'),
        crudService.list<HouseTypeRecord>('house_types'),
        crudService.list<UnitRecord>('units'),
        crudService.list<PaymentAccountRecord>('payment_accounts').catch(() => []),
        this.getExpiryHours(),
      ])

    return {
      projects,
      houseTypes,
      units: units.filter((u) => u.status !== 'inactive'),
      paymentAccounts: paymentAccounts.filter((acc) => acc.is_active),
      expiryHours,
    }
  },

  /**
   * Membuat reservasi unit secara atomik.
   * Di Supabase production, menggunakan PostgreSQL RPC `create_unit_reservation`
   * dengan `SELECT ... FOR UPDATE` row-level locking untuk mencegah double booking.
   */
  async createReservation(
    payload: CreateReservationPayload,
    customerId: string,
  ): Promise<CreatedReservationResult> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { data, error } = await supabase.rpc('create_unit_reservation', {
        p_unit_id: payload.unitId,
        p_customer_full_name: payload.customerFullName.trim(),
        p_customer_email: payload.customerEmail.trim().toLowerCase(),
        p_customer_phone: payload.customerPhone.trim(),
        p_customer_identity_number: payload.customerIdentityNumber.trim(),
        p_customer_address: payload.customerAddress.trim(),
        p_notes: payload.notes?.trim() || null,
      })

      if (error) {
        throw new Error(error.message || 'Gagal membuat reservasi unit.')
      }

      const rpcObj = (data ?? {}) as Record<string, unknown>
      const reservationId = String(rpcObj.reservation_id ?? rpcObj.id ?? '')

      // Ambil ringkasan lengkap dari tabel hasil transaksi
      const { data: fullRow } = await supabase
        .from('reservations')
        .select('id, reservation_number, unit_price, booking_fee_amount, expires_at, status, project_id, house_type_id, unit_id')
        .eq('id', reservationId)
        .maybeSingle<Record<string, unknown>>()

      const catalog = await this.getReservationCatalog()
      const unit = catalog.units.find((u) => u.id === payload.unitId)
      const project = catalog.projects.find((p) => p.id === (fullRow?.project_id ?? unit?.project_id))
      const houseType = catalog.houseTypes.find(
        (h) => h.id === (fullRow?.house_type_id ?? unit?.house_type_id),
      )

      return {
        reservationId: String(fullRow?.id ?? reservationId),
        reservationNumber: String(
          fullRow?.reservation_number ?? rpcObj.reservation_number ?? 'RSV-BARU',
        ),
        unitCode: unit?.unit_code ?? String(rpcObj.unit_number ?? '—'),
        projectName: project?.name ?? 'Proyek PERUMAHAN',
        houseTypeName: houseType?.name ?? 'Tipe Rumah',
        unitPrice: Number(fullRow?.unit_price ?? unit?.price ?? 0),
        bookingFee: Number(
          fullRow?.booking_fee_amount ?? rpcObj.booking_fee_amount ?? houseType?.booking_fee ?? 0,
        ),
        expiresAt: String(
          fullRow?.expires_at ??
            rpcObj.expires_at ??
            new Date(Date.now() + catalog.expiryHours * 3600 * 1000).toISOString(),
        ),
        status: (String(fullRow?.status ?? 'pending') as ReservationRecord['status']),
      }
    }

    // Fallback Mode Demo (atomic synchronous check in localStorage)
    await new Promise((resolve) => setTimeout(resolve, 350))
    const db = loadDemoDb()
    const now = new Date()

    // Release expired pending reservations first
    for (const r of db.reservations) {
      if (r.status === 'pending' && new Date(r.expires_at) < now) {
        r.status = 'expired'
        const lockedUnit = db.units.find((u) => u.id === r.unit_id)
        if (lockedUnit && lockedUnit.status === 'reserved') {
          lockedUnit.status = 'available'
        }
      }
    }

    const unit = db.units.find((u) => u.id === payload.unitId && !u.deleted_at)
    if (!unit) {
      throw new Error('Unit yang dipilih tidak ditemukan.')
    }
    if (unit.status !== 'available') {
      throw new Error(
        `Maaf, unit ${unit.unit_code} sudah dipesan pelanggan lain (status: ${unit.status}). Silakan pilih unit lain yang tersedia.`,
      )
    }

    const project = db.projects.find((p) => p.id === unit.project_id)
    const houseType = db.house_types.find((h) => h.id === unit.house_type_id)
    const expiryHours = db.settings.reservationExpiryHours || 24
    const expiresAt = new Date(now.getTime() + expiryHours * 3600 * 1000).toISOString()
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '')
    const reservationNumber = `RSV-${dateStamp}-${Math.floor(1000 + Math.random() * 9000)}`
    const reservationId = `rsv-${Date.now()}`
    const bookingFee = houseType?.booking_fee ?? 5000000

    // Lock unit immediately
    unit.status = 'reserved'
    unit.updated_at = now.toISOString()

    const newReservation: ReservationRecord = {
      id: reservationId,
      reservation_number: reservationNumber,
      customer_id: customerId,
      project_id: unit.project_id,
      house_type_id: unit.house_type_id,
      unit_id: unit.id,
      assigned_sales_id: unit.assigned_sales_id,
      customer_name: payload.customerFullName.trim(),
      customer_nik: payload.customerIdentityNumber.trim(),
      customer_phone: payload.customerPhone.trim(),
      customer_email: payload.customerEmail.trim().toLowerCase(),
      customer_address: payload.customerAddress.trim(),
      unit_price: unit.price,
      booking_fee: bookingFee,
      status: 'pending',
      expires_at: expiresAt,
      confirmed_at: null,
      cancelled_at: null,
      cancellation_reason: '',
      notes: payload.notes?.trim() ?? '',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    }

    db.reservations.unshift(newReservation)
    db.payments.unshift({
      id: `pay-${Date.now()}`,
      reservation_id: reservationId,
      customer_id: customerId,
      payment_account_id: null,
      amount: bookingFee,
      payment_date: null,
      sender_bank: '',
      sender_name: '',
      proof_storage_path: '',
      status: 'unpaid',
      verified_by: null,
      verified_at: null,
      rejection_reason: '',
      notes: '',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      deleted_at: null,
    })

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: customerId,
      type: 'reservation_created',
      title: `Reservasi ${reservationNumber} Berhasil`,
      message: `Unit ${unit.unit_code} terkunci sementara selama ${expiryHours} jam. Segera transfer booking fee dan unggah bukti transfer.`,
      reference_type: 'reservation',
      reference_id: reservationId,
      is_read: false,
      read_at: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })

    appendDemoActivityLog(db, {
      actorId: customerId,
      actorRole: 'customer',
      action: 'reservation.created',
      entityType: 'reservation',
      entityId: reservationId,
      summary: `Pelanggan membuat reservasi ${reservationNumber} untuk unit ${unit.unit_code}`,
    })

    saveDemoDb(db)

    return {
      reservationId,
      reservationNumber,
      unitCode: unit.unit_code,
      projectName: project?.name ?? 'Proyek PERUMAHAN',
      houseTypeName: houseType?.name ?? 'Tipe Rumah',
      unitPrice: unit.price,
      bookingFee,
      expiresAt,
      status: 'pending',
    }
  },

  async listCustomerReservations(customerId: string): Promise<EnrichedReservation[]> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      await supabase.rpc('expire_overdue_reservations')
    }

    const [reservations, payments, projects, houseTypes, units] = await Promise.all([
      crudService.list<ReservationRecord>('reservations'),
      crudService.list<PaymentRecord>('payments'),
      crudService.list<ProjectRecord>('projects'),
      crudService.list<HouseTypeRecord>('house_types'),
      crudService.list<UnitRecord>('units'),
    ])

    const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]))
    const houseTypeMap = Object.fromEntries(houseTypes.map((h) => [h.id, h]))
    const unitMap = Object.fromEntries(units.map((u) => [u.id, u]))
    const paymentByRsv = Object.fromEntries(payments.map((p) => [p.reservation_id, p]))

    return reservations
      .filter((r) => r.customer_id === customerId)
      .map((r) => ({
        ...r,
        projectName: projectMap[r.project_id]?.name ?? 'Proyek PERUMAHAN',
        projectLocation: projectMap[r.project_id]?.location ?? '',
        houseTypeName: houseTypeMap[r.house_type_id]?.name ?? 'Tipe Rumah',
        unitCode: unitMap[r.unit_id]?.unit_code ?? '—',
        unitBlock: unitMap[r.unit_id]?.block ?? '',
        payment: paymentByRsv[r.id] ?? null,
      }))
  },

  async cancelReservation(
    reservationId: string,
    reason: string,
    customerId: string,
  ): Promise<void> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { error } = await supabase.rpc('cancel_reservation', {
        p_reservation_id: reservationId,
        p_reason: reason.trim() || 'Dibatalkan oleh pelanggan.',
      })
      if (error) {
        throw new Error(error.message || 'Gagal membatalkan reservasi.')
      }
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
    const db = loadDemoDb()
    const rsv = db.reservations.find(
      (r) => r.id === reservationId && r.customer_id === customerId,
    )
    if (!rsv) throw new Error('Reservasi tidak ditemukan.')
    if (rsv.status !== 'pending' && rsv.status !== 'awaiting_verification') {
      throw new Error('Reservasi yang sudah dikonfirmasi/selesai tidak dapat dibatalkan sendiri.')
    }

    rsv.status = 'cancelled'
    rsv.cancelled_at = new Date().toISOString()
    rsv.cancellation_reason = reason.trim() || 'Dibatalkan oleh pelanggan.'
    rsv.updated_at = new Date().toISOString()

    const unit = db.units.find((u) => u.id === rsv.unit_id)
    if (unit && unit.status === 'reserved') {
      unit.status = 'available'
    }

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: customerId,
      type: 'reservation_cancelled',
      title: `Reservasi ${rsv.reservation_number} Dibatalkan`,
      message: `Reservasi Anda telah dibatalkan dan unit ${unit?.unit_code ?? ''} kembali tersedia.`,
      reference_type: 'reservation',
      reference_id: rsv.id,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    appendDemoActivityLog(db, {
      actorId: customerId,
      actorRole: 'customer',
      action: 'reservation.cancelled',
      entityType: 'reservation',
      entityId: rsv.id,
      summary: `Membatalkan reservasi ${rsv.reservation_number}`,
    })

    saveDemoDb(db)
  },
}
