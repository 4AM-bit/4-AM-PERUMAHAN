import { IS_SUPABASE_CONFIGURED } from '@/lib/config'
import {
  appendDemoActivityLog,
  crudService,
  loadDemoDb,
  saveDemoDb,
} from '@/services/crudStore'
import { supabase } from '@/supabase/client'
import type {
  ActivityLogRecord,
  PaymentRecord,
  ProfileRecord,
  ProjectRecord,
  ReservationRecord,
  UnitRecord,
} from '@/types/database'
import type { UserRole } from '@/types/auth'

export interface AdminDashboardMetrics {
  totalProjects: number
  totalUnits: number
  availableUnits: number
  reservedUnits: number
  soldUnits: number
  totalCustomers: number
  totalReservations: number
  pendingVerificationPayments: number
  totalVerifiedBookingRevenue: number
  totalConfirmedSalesValue: number
  monthlySeries: Array<{
    month: string
    reservasi: number
    terkonfirmasi: number
    penjualanMiliar: number
  }>
  unitDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  recentLogs: ActivityLogRecord[]
}

export interface SystemSettingsData {
  reservationExpiryHours: number
  officeName: string
  whatsapp: string
  email: string
  address: string
}

const MONTH_LABELS = ['Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov']

export const dashboardService = {
  async getAdminMetrics(): Promise<AdminDashboardMetrics> {
    const [projects, units, profiles, reservations, payments, logs] =
      await Promise.all([
        crudService.list<ProjectRecord>('projects'),
        crudService.list<UnitRecord>('units'),
        crudService.list<ProfileRecord>('profiles').catch(() => []),
        crudService.list<ReservationRecord>('reservations').catch(() => []),
        crudService.list<PaymentRecord>('payments').catch(() => []),
        this.listActivityLogs(),
      ])

    const availableUnits = units.filter((u) => u.status === 'available').length
    const reservedUnits = units.filter((u) => u.status === 'reserved').length
    const soldUnits = units.filter((u) => u.status === 'sold').length
    const totalCustomers = profiles.filter((p) => p.role === 'customer').length
    const pendingVerificationPayments = payments.filter(
      (p) => p.status === 'pending_verification',
    ).length
    const totalVerifiedBookingRevenue = payments
      .filter((p) => p.status === 'verified')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const totalConfirmedSalesValue = reservations
      .filter((r) => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + Number(r.unit_price || 0), 0)

    // Bangun seri 6 bulan terakhir (gabungan data riil bulan berjalan + tren historis bila transaksi baru mulai)
    const currentMonthReservations = reservations.length
    const currentMonthConfirmed = reservations.filter(
      (r) => r.status === 'confirmed' || r.status === 'completed',
    ).length
    const currentSalesBillion = Number(
      (totalConfirmedSalesValue / 1_000_000_000).toFixed(2),
    )

    const monthlySeries = MONTH_LABELS.map((month, idx) => {
      if (idx === MONTH_LABELS.length - 1) {
        return {
          month,
          reservasi: currentMonthReservations,
          terkonfirmasi: currentMonthConfirmed,
          penjualanMiliar: currentSalesBillion,
        }
      }
      // Agregasi dari created_at apabila ada data historis pada bulan tersebut
      const monthIndexOffset = MONTH_LABELS.length - 1 - idx
      const targetDate = new Date()
      targetDate.setMonth(targetDate.getMonth() - monthIndexOffset)
      const targetYM = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`

      const monthRsv = reservations.filter((r) => r.created_at.startsWith(targetYM))
      const monthConf = monthRsv.filter(
        (r) => r.status === 'confirmed' || r.status === 'completed',
      )
      const monthSales =
        monthConf.reduce((sum, r) => sum + Number(r.unit_price || 0), 0) / 1_000_000_000

      return {
        month,
        reservasi: monthRsv.length,
        terkonfirmasi: monthConf.length,
        penjualanMiliar: Number(monthSales.toFixed(2)),
      }
    })

    const unitDistribution = [
      { name: 'Tersedia', value: availableUnits, color: '#285C49' },
      { name: 'Reserved', value: reservedUnits, color: '#D8B978' },
      { name: 'Terjual', value: soldUnits, color: '#173F35' },
    ]

    return {
      totalProjects: projects.length,
      totalUnits: units.length,
      availableUnits,
      reservedUnits,
      soldUnits,
      totalCustomers,
      totalReservations: reservations.length,
      pendingVerificationPayments,
      totalVerifiedBookingRevenue,
      totalConfirmedSalesValue,
      monthlySeries,
      unitDistribution,
      recentLogs: logs.slice(0, 8),
    }
  },

  async listActivityLogs(): Promise<ActivityLogRecord[]> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, actor_id, actor_role, action, entity_type, entity_id, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(150)

      if (error) {
        return []
      }

      return (data ?? []).map((row) => {
        const meta = (row.metadata ?? {}) as Record<string, unknown>
        const fallbackSummary = `${row.action} (${row.entity_type})`
        return {
          id: String(row.id),
          actor_id: row.actor_id ? String(row.actor_id) : null,
          actor_role: (row.actor_role as UserRole | null) ?? null,
          action: String(row.action),
          entity_type: String(row.entity_type),
          entity_id: row.entity_id ? String(row.entity_id) : null,
          summary:
            typeof meta.summary === 'string' && meta.summary.trim()
              ? meta.summary
              : fallbackSummary,
          metadata: meta,
          created_at: String(row.created_at),
        }
      })
    }

    return loadDemoDb().activity_logs
  },

  async getSystemSettings(): Promise<SystemSettingsData> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { data } = await supabase
        .from('app_settings')
        .select('key, value')

      const map = Object.fromEntries(
        (data ?? []).map((item) => [item.key, item.value as Record<string, unknown>]),
      )

      const expiry = map.reservation_expiry_hours ?? {}
      const contact = map.developer_contact ?? {}

      return {
        reservationExpiryHours: Number(expiry.hours ?? 24),
        officeName: String(contact.office_name ?? 'Marketing Gallery PT Abdurrahman Properti'),
        whatsapp: String(contact.whatsapp ?? '6282171218646'),
        email: String(contact.email ?? 'halo@perumahan.co.id'),
        address: String(
          contact.address ??
            'Kantor Pusat: Alam Sutera, Tangerang | Kantor Cabang: Blang Bintang, Aceh Besar',
        ),
      }
    }

    const demo = loadDemoDb().settings
    return {
      reservationExpiryHours: demo.reservationExpiryHours,
      officeName: 'Marketing Gallery PT Abdurrahman Properti',
      whatsapp: demo.whatsappNumber,
      email: demo.supportEmail,
      address: demo.officeAddress,
    }
  },

  async updateSystemSettings(
    input: SystemSettingsData,
    actor: { id: string; role: UserRole },
  ): Promise<void> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const now = new Date().toISOString()
      const updates = [
        {
          key: 'reservation_expiry_hours',
          value: { hours: input.reservationExpiryHours },
          updated_by: actor.id,
          updated_at: now,
        },
        {
          key: 'developer_contact',
          value: {
            office_name: input.officeName.trim(),
            whatsapp: input.whatsapp.trim(),
            email: input.email.trim(),
            address: input.address.trim(),
          },
          updated_by: actor.id,
          updated_at: now,
        },
      ]

      const { error } = await supabase
        .from('app_settings')
        .upsert(updates, { onConflict: 'key' })

      if (error) {
        throw new Error(`Gagal menyimpan pengaturan sistem: ${error.message}`)
      }

      await supabase.from('activity_logs').insert({
        actor_id: actor.id,
        actor_role: actor.role,
        action: 'settings.updated',
        entity_type: 'app_settings',
        entity_id: null,
        metadata: {
          summary: `Memperbarui masa berlaku reservasi (${input.reservationExpiryHours} jam) & info developer`,
          hours: input.reservationExpiryHours,
        },
      })
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
    const db = loadDemoDb()
    db.settings = {
      reservationExpiryHours: input.reservationExpiryHours,
      whatsappNumber: input.whatsapp.trim(),
      supportEmail: input.email.trim(),
      officeAddress: input.address.trim(),
    }
    appendDemoActivityLog(db, {
      actorId: actor.id,
      actorRole: actor.role,
      action: 'settings.updated',
      entityType: 'app_settings',
      entityId: null,
      summary: `Memperbarui masa berlaku reservasi menjadi ${input.reservationExpiryHours} jam`,
    })
    saveDemoDb(db)
  },
}
