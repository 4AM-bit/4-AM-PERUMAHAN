import { IS_SUPABASE_CONFIGURED } from '@/lib/config'
import { loadDemoDb, saveDemoDb } from '@/services/crudStore'
import { reservationService } from '@/services/reservationService'
import { supabase } from '@/supabase/client'
import type { NotificationRecord } from '@/types/database'

export const notificationService = {
  async listUserNotifications(userId: string): Promise<NotificationRecord[]> {
    let items: NotificationRecord[] = []

    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        throw new Error(`Gagal memuat notifikasi: ${error.message}`)
      }
      items = (data ?? []) as NotificationRecord[]
    } else {
      items = loadDemoDb().notifications.filter((n) => n.user_id === userId)
    }

    // Cek reservasi pending yang akan kedaluwarsa dalam <= 3 jam agar pelanggan mendapat pengingat proaktif
    try {
      const reservations = await reservationService.listCustomerReservations(userId)
      const now = Date.now()
      const threeHoursMs = 3 * 3600 * 1000
      const expiringAlerts: NotificationRecord[] = reservations
        .filter((r) => {
          if (r.status !== 'pending') return false
          const diff = new Date(r.expires_at).getTime() - now
          return diff > 0 && diff <= threeHoursMs
        })
        .map((r) => ({
          id: `expiring-${r.id}`,
          user_id: userId,
          type: 'reservation_expiring',
          title: `Reservasi ${r.reservation_number} Akan Segera Kedaluwarsa`,
          message: `Batas waktu transfer booking fee untuk Unit ${r.unitCode} tersisa kurang dari 3 jam. Segera unggah bukti transfer agar unit tidak dilepas otomatis.`,
          reference_type: 'reservation',
          reference_id: r.id,
          is_read: false,
          read_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

      return [...expiringAlerts, ...items]
    } catch {
      return items
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    const list = await this.listUserNotifications(userId)
    return list.filter((n) => !n.is_read).length
  },

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    if (notificationId.startsWith('expiring-')) return

    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', userId)

      if (error) throw new Error(error.message)
      return
    }

    const db = loadDemoDb()
    const target = db.notifications.find(
      (n) => n.id === notificationId && n.user_id === userId,
    )
    if (target) {
      target.is_read = true
      target.read_at = new Date().toISOString()
      saveDemoDb(db)
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw new Error(error.message)
      return
    }

    const db = loadDemoDb()
    const now = new Date().toISOString()
    for (const n of db.notifications) {
      if (n.user_id === userId && !n.is_read) {
        n.is_read = true
        n.read_at = now
      }
    }
    saveDemoDb(db)
  },
}
