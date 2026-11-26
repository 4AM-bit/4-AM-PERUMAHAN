import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Copy,
  CreditCard,
  Eye,
  FileCheck2,
  Landmark,
  Loader2,
  Plus,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ReservationCountdown } from '@/components/common/ReservationCountdown'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { crudService } from '@/services/crudStore'
import {
  reservationService,
  type EnrichedReservation,
} from '@/services/reservationService'
import type { PaymentAccountRecord, ReservationStatus } from '@/types/database'
import { formatCurrency } from '@/utils/format'
import {
  formatDateTimeID,
  PAYMENT_STATUS_META,
  RESERVATION_STATUS_META,
} from '@/utils/statusBadges'
import { cn } from '@/utils/cn'

const FILTER_TABS: Array<{ label: string; value: 'all' | ReservationStatus }> = [
  { label: 'Semua', value: 'all' },
  { label: 'Menunggu Transfer', value: 'pending' },
  { label: 'Verifikasi', value: 'awaiting_verification' },
  { label: 'Terkonfirmasi', value: 'confirmed' },
  { label: 'Selesai', value: 'completed' },
  { label: 'Dibatalkan', value: 'cancelled' },
]

export function CustomerReservationsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [reservations, setReservations] = useState<EnrichedReservation[]>([])
  const [accounts, setAccounts] = useState<PaymentAccountRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | ReservationStatus>('all')
  const [detailRow, setDetailRow] = useState<EnrichedReservation | null>(null)
  const [cancellingRow, setCancellingRow] = useState<EnrichedReservation | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const loadData = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const [list, accList] = await Promise.all([
        reservationService.listCustomerReservations(user.id),
        crudService.list<PaymentAccountRecord>('payment_accounts').catch(() => []),
      ])
      setReservations(list)
      setAccounts(accList.filter((a) => a.is_active))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar reservasi.')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    if (activeTab === 'all') return reservations
    return reservations.filter((r) => r.status === activeTab)
  }, [reservations, activeTab])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast({ variant: 'info', title: 'Disalin', description: text })
    } catch {
      // ignore
    }
  }

  const handleConfirmCancel = async () => {
    if (!cancellingRow || !user) return
    setIsCancelling(true)
    try {
      await reservationService.cancelReservation(
        cancellingRow.id,
        cancelReason || 'Dibatalkan oleh pelanggan.',
        user.id,
      )
      showToast({
        variant: 'info',
        title: 'Reservasi Dibatalkan',
        description: `Reservasi ${cancellingRow.reservation_number} telah dibatalkan dan unit kembali tersedia.`,
      })
      setCancellingRow(null)
      setDetailRow(null)
      setCancelReason('')
      await loadData()
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Gagal Membatalkan Reservasi',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan.',
      })
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
            Portal Pelanggan
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
            Reservasi Saya
          </h1>
          <p className="mt-1 text-sm text-[#5F6B66]">
            Pantau status penguncian unit, batas waktu pembayaran, dan instruksi transfer bank resmi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={() => void loadData()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button variant="primary" size="md" to="/dashboard/reservasi/baru">
            <Plus className="h-4 w-4 text-[#D8B978]" />
            Buat Reservasi Unit
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-semibold transition-colors cursor-pointer',
              activeTab === tab.value
                ? 'bg-[#173F35] text-white'
                : 'bg-white border border-[#E3E0D6] text-[#5F6B66] hover:text-[#173F35]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-center justify-between gap-3 text-sm text-red-700">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadData()}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center gap-3 text-sm text-[#5F6B66]">
          <Loader2 className="h-7 w-7 animate-spin text-[#173F35]" />
          Memuat daftar reservasi Anda...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E3E0D6] bg-white px-6 py-16 text-center space-y-3">
          <FileCheck2 className="mx-auto h-10 w-10 text-[#5F6B66]/45" />
          <p className="font-display text-lg font-bold text-[#173F35]">
            Belum ada reservasi pada kategori ini
          </p>
          <p className="text-sm text-[#5F6B66] max-w-md mx-auto">
            Pilih proyek, tipe rumah, dan nomor kavling tersedia untuk mengunci unit impian Anda.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="md" to="/dashboard/reservasi/baru">
              <Plus className="h-4 w-4 text-[#D8B978]" />
              Mulai Reservasi Unit Sekarang
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rsv) => {
            const statusMeta = RESERVATION_STATUS_META[rsv.status]
            const payMeta = rsv.payment
              ? PAYMENT_STATUS_META[rsv.payment.status]
              : PAYMENT_STATUS_META.unpaid

            return (
              <article
                key={rsv.id}
                className="rounded-2xl border border-[#E3E0D6] bg-white p-5 sm:p-6 shadow-[var(--shadow-card)] space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="rounded-lg bg-[#F5F4EF] px-2.5 py-1 font-mono text-xs font-bold text-[#173F35]">
                        {rsv.reservation_number}
                      </code>
                      <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                      <Badge variant={payMeta.variant}>Bayar: {payMeta.label}</Badge>
                    </div>
                    <h2 className="mt-2.5 font-display text-lg font-bold text-[#173F35]">
                      Unit {rsv.unitCode} — {rsv.houseTypeName}
                    </h2>
                    <p className="text-xs text-[#5F6B66]">
                      {rsv.projectName} • {rsv.unitBlock} • Dibuat {formatDateTimeID(rsv.created_at)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[11px] uppercase tracking-wider text-[#5F6B66]">
                      Booking Fee
                    </p>
                    <p className="font-display text-xl font-extrabold text-[#173F35]">
                      {formatCurrency(rsv.booking_fee)}
                    </p>
                    <p className="text-xs text-[#5F6B66]">
                      Harga Unit: {formatCurrency(rsv.unit_price)}
                    </p>
                  </div>
                </div>

                {rsv.status === 'pending' && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#FAF7EF] border border-[#D8B978]/45 px-4 py-3">
                    <ReservationCountdown expiresAt={rsv.expires_at} />
                    <span className="text-xs text-[#5F6B66]">
                      Batas transfer: <strong className="text-[#173F35]">{formatDateTimeID(rsv.expires_at)}</strong>
                    </span>
                  </div>
                )}

                {rsv.cancellation_reason && (
                  <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700">
                    <strong>Keterangan:</strong> {rsv.cancellation_reason}
                  </p>
                )}

                <div className="pt-3 border-t border-[#E3E0D6]/80 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDetailRow(rsv)}>
                      <Eye className="h-3.5 w-3.5" />
                      Detail &amp; Instruksi Transfer
                    </Button>
                    {rsv.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCancellingRow(rsv)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Batalkan
                      </Button>
                    )}
                  </div>

                  {(rsv.status === 'pending' || rsv.status === 'rejected') && (
                    <Button
                      variant="primary"
                      size="sm"
                      to={`/dashboard/pembayaran?reservasi=${rsv.id}`}
                    >
                      <CreditCard className="h-3.5 w-3.5 text-[#D8B978]" />
                      Unggah Bukti Transfer
                    </Button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Detail & Bank Transfer Modal */}
      <Modal
        open={Boolean(detailRow)}
        onClose={() => setDetailRow(null)}
        title="Detail Reservasi & Instruksi Pembayaran"
        subtitle={detailRow?.reservation_number}
        size="lg"
      >
        {detailRow && (
          <div className="space-y-5">
            <div className="divide-y divide-[#E3E0D6]/80 rounded-xl border border-[#E3E0D6] text-sm">
              <div className="grid grid-cols-12 px-4 py-3 odd:bg-[#FAF9F5]">
                <span className="col-span-5 font-semibold text-[#173F35]">No. Reservasi</span>
                <span className="col-span-7 font-mono font-bold">{detailRow.reservation_number}</span>
              </div>
              <div className="grid grid-cols-12 px-4 py-3 odd:bg-[#FAF9F5]">
                <span className="col-span-5 font-semibold text-[#173F35]">Unit &amp; Proyek</span>
                <span className="col-span-7">
                  <strong>{detailRow.unitCode}</strong> — {detailRow.houseTypeName} ({detailRow.projectName})
                </span>
              </div>
              <div className="grid grid-cols-12 px-4 py-3 odd:bg-[#FAF9F5]">
                <span className="col-span-5 font-semibold text-[#173F35]">Pemesan</span>
                <span className="col-span-7">
                  {detailRow.customer_name} • NIK {detailRow.customer_nik}
                </span>
              </div>
              <div className="grid grid-cols-12 px-4 py-3 odd:bg-[#FAF9F5]">
                <span className="col-span-5 font-semibold text-[#173F35]">Booking Fee</span>
                <span className="col-span-7 font-bold text-[#285C49]">
                  {formatCurrency(detailRow.booking_fee)}
                </span>
              </div>
              <div className="grid grid-cols-12 px-4 py-3 odd:bg-[#FAF9F5]">
                <span className="col-span-5 font-semibold text-[#173F35]">Status Reservasi</span>
                <span className="col-span-7">
                  <Badge variant={RESERVATION_STATUS_META[detailRow.status].variant}>
                    {RESERVATION_STATUS_META[detailRow.status].label}
                  </Badge>
                </span>
              </div>
            </div>

            {accounts.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#285C49] flex items-center gap-1.5">
                  <Landmark className="h-4 w-4" />
                  Rekening Resmi Developer (Transfer Manual)
                </p>
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="rounded-xl border border-[#E3E0D6] bg-[#FAF9F5] p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="text-xs">
                      <p className="font-bold text-[#173F35]">{acc.bank_name}</p>
                      <p className="font-mono text-sm font-bold text-[#285C49]">
                        {acc.account_number}
                      </p>
                      <p className="text-[#5F6B66]">a.n. {acc.account_holder}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleCopy(acc.account_number)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Salin
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(cancellingRow)}
        title={`Batalkan Reservasi ${cancellingRow?.reservation_number ?? ''}?`}
        description="Unit yang sedang terkunci akan langsung dilepaskan kembali menjadi Tersedia bagi pelanggan lain."
        confirmLabel="Ya, Batalkan Reservasi"
        isLoading={isCancelling}
        onCancel={() => !isCancelling && setCancellingRow(null)}
        onConfirm={() => void handleConfirmCancel()}
      />
    </div>
  )
}
