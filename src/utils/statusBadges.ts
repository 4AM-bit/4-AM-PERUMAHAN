import type { BadgeVariant } from '@/components/ui/Badge'
import type { PaymentStatus, ReservationStatus } from '@/types/database'
import type { ProjectStatus, UnitStatus } from '@/types/property'

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
  launching: { label: 'New Launch', variant: 'gold' },
  available: { label: 'Tersedia', variant: 'emerald' },
  limited: { label: 'Unit Terbatas', variant: 'warning' },
  sold_out: { label: 'Terjual Habis', variant: 'muted' },
}

export const UNIT_STATUS_META: Record<UnitStatus, { label: string; variant: BadgeVariant }> = {
  available: { label: 'Tersedia', variant: 'emerald' },
  reserved: { label: 'Reserved', variant: 'gold' },
  sold: { label: 'Terjual', variant: 'forest' },
  inactive: { label: 'Nonaktif', variant: 'muted' },
}

export const RESERVATION_STATUS_META: Record<
  ReservationStatus,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: 'Menunggu Transfer', variant: 'warning' },
  awaiting_verification: { label: 'Menunggu Verifikasi', variant: 'gold' },
  confirmed: { label: 'Terkonfirmasi', variant: 'emerald' },
  rejected: { label: 'Ditolak', variant: 'muted' },
  expired: { label: 'Kedaluwarsa', variant: 'muted' },
  cancelled: { label: 'Dibatalkan', variant: 'muted' },
  completed: { label: 'Selesai / Akad', variant: 'forest' },
}

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; variant: BadgeVariant }> = {
  unpaid: { label: 'Belum Dibayar', variant: 'muted' },
  pending_verification: { label: 'Menunggu Verifikasi', variant: 'gold' },
  verified: { label: 'Terverifikasi', variant: 'emerald' },
  rejected: { label: 'Ditolak', variant: 'warning' },
}

export function formatDateTimeID(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
