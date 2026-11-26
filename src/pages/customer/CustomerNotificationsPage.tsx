import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck2,
  Home,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { notificationService } from '@/services/notificationService'
import type { NotificationRecord } from '@/types/database'
import { formatDateTimeID } from '@/utils/statusBadges'
import { cn } from '@/utils/cn'

function getNotificationIcon(type: string) {
  switch (type) {
    case 'reservation_created':
      return { icon: FileCheck2, tone: 'bg-[#173F35]/10 text-[#173F35]' }
    case 'reservation_expiring':
      return { icon: Clock, tone: 'bg-amber-100 text-amber-800' }
    case 'payment_submitted':
      return { icon: CreditCard, tone: 'bg-[#D8B978]/25 text-[#7A5D20]' }
    case 'payment_verified':
      return { icon: CheckCircle2, tone: 'bg-[#285C49]/15 text-[#285C49]' }
    case 'payment_rejected':
      return { icon: AlertTriangle, tone: 'bg-red-100 text-red-700' }
    case 'reservation_cancelled':
      return { icon: XCircle, tone: 'bg-neutral-100 text-neutral-600' }
    case 'unit_status_changed':
      return { icon: Home, tone: 'bg-[#173F35]/10 text-[#173F35]' }
    default:
      return { icon: Bell, tone: 'bg-[#F5F4EF] text-[#173F35]' }
  }
}

function getNotificationActionLink(item: NotificationRecord): string | null {
  if (item.reference_type === 'payment') return '/dashboard/pembayaran'
  if (item.reference_type === 'reservation') return '/dashboard/reservasi'
  return null
}

export function CustomerNotificationsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [items, setItems] = useState<NotificationRecord[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isLoading, setIsLoading] = useState(true)

  const loadNotifications = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const list = await notificationService.listUserNotifications(user.id)
      setItems(list)
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Gagal Memuat Notifikasi',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, showToast])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  const unreadCount = useMemo(
    () => items.filter((item) => !item.is_read).length,
    [items],
  )

  const visibleItems = useMemo(
    () => (filter === 'unread' ? items.filter((i) => !i.is_read) : items),
    [items, filter],
  )

  const handleMarkRead = async (id: string) => {
    if (!user) return
    try {
      await notificationService.markAsRead(id, user.id)
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
      )
    } catch {
      // ignore
    }
  }

  const handleMarkAllRead = async () => {
    if (!user) return
    try {
      await notificationService.markAllAsRead(user.id)
      setItems((prev) => prev.map((item) => ({ ...item, is_read: true })))
      showToast({
        variant: 'success',
        title: 'Semua Notifikasi Ditandai Dibaca',
      })
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
            Pusat Pemberitahuan
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
            Notifikasi Akun
          </h1>
          <p className="mt-1 text-sm text-[#5F6B66]">
            Pantau pembaruan status reservasi, pengingat batas waktu transfer, dan hasil
            verifikasi pembayaran Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadNotifications()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="primary" size="sm" onClick={() => void handleMarkAllRead()}>
              <CheckCheck className="h-4 w-4 text-[#D8B978]" />
              Tandai Semua Dibaca ({unreadCount})
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={cn(
            'rounded-full px-4 py-2 text-xs font-semibold cursor-pointer transition-colors',
            filter === 'all'
              ? 'bg-[#173F35] text-white'
              : 'bg-white border border-[#E3E0D6] text-[#5F6B66] hover:text-[#173F35]',
          )}
        >
          Semua ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={cn(
            'rounded-full px-4 py-2 text-xs font-semibold cursor-pointer transition-colors',
            filter === 'unread'
              ? 'bg-[#173F35] text-white'
              : 'bg-white border border-[#E3E0D6] text-[#5F6B66] hover:text-[#173F35]',
          )}
        >
          Belum Dibaca ({unreadCount})
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#173F35]" />
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E3E0D6] bg-white p-14 text-center space-y-2">
          <Bell className="mx-auto h-10 w-10 text-[#5F6B66]/40" />
          <p className="font-display text-base font-bold text-[#173F35]">
            Tidak ada notifikasi pada filter ini
          </p>
          <p className="text-xs text-[#5F6B66]">
            Setiap aktivitas reservasi dan verifikasi pembayaran akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleItems.map((item) => {
            const { icon: Icon, tone } = getNotificationIcon(item.type)
            const actionUrl = getNotificationActionLink(item)

            return (
              <article
                key={item.id}
                className={cn(
                  'rounded-2xl border p-5 transition-all flex items-start gap-4',
                  item.is_read
                    ? 'border-[#E3E0D6] bg-white'
                    : 'border-[#285C49]/35 bg-[#FAF9F5] shadow-xs',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    tone,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-sm font-bold text-[#173F35]">
                        {item.title}
                      </h2>
                      {!item.is_read && <Badge variant="gold">Baru</Badge>}
                    </div>
                    <span className="text-[11px] text-[#5F6B66]">
                      {formatDateTimeID(item.created_at)}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs leading-relaxed text-[#5F6B66]">
                    {item.message}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {actionUrl && (
                      <Link
                        to={actionUrl}
                        onClick={() => void handleMarkRead(item.id)}
                        className="text-xs font-semibold text-[#173F35] hover:text-[#285C49] underline underline-offset-4"
                      >
                        Buka Detail Terkait →
                      </Link>
                    )}
                    {!item.is_read && !item.id.startsWith('expiring-') && (
                      <button
                        type="button"
                        onClick={() => void handleMarkRead(item.id)}
                        className="text-xs font-medium text-[#5F6B66] hover:text-[#173F35] cursor-pointer"
                      >
                        Tandai sudah dibaca
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
