import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, CreditCard, FileCheck2, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import {
  reservationService,
  type EnrichedReservation,
} from '@/services/reservationService'
import { formatCurrency } from '@/utils/format'
import { RESERVATION_STATUS_META } from '@/utils/statusBadges'

export function CustomerOverviewPage() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<EnrichedReservation[]>([])

  useEffect(() => {
    if (!user) return
    void reservationService
      .listCustomerReservations(user.id)
      .then(setReservations)
      .catch(() => {})
  }, [user])

  const activeCount = reservations.filter((r) =>
    ['pending', 'awaiting_verification', 'confirmed'].includes(r.status),
  ).length
  const pendingPaymentCount = reservations.filter((r) => r.status === 'pending').length
  const latest = reservations[0] ?? null

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#173F35] p-6 sm:p-8 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="gold" className="bg-[#D8B978]/20 text-[#EFE3C6] border-[#D8B978]/40">
            Akun Pelanggan Aktif
          </Badge>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold">
            Selamat Datang, {user?.fullName}
          </h1>
          <p className="mt-1.5 text-sm text-white/80 max-w-xl">
            Kelola profil identitas Anda, buat reservasi unit dengan penguncian otomatis,
            dan pantau status verifikasi pembayaran secara transparan.
          </p>
        </div>
        <Button variant="gold" size="md" to="/dashboard/reservasi/baru">
          <Plus className="h-4 w-4" />
          Buat Reservasi Unit
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-[#E3E0D6] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F6B66]">Status Profil</span>
            <User className="h-4 w-4 text-[#285C49]" />
          </div>
          <p className="mt-2 font-display text-lg font-bold text-[#173F35]">
            {user?.nik ? 'Lengkap (Siap Reservasi)' : 'Lengkapi NIK & Alamat'}
          </p>
          <Button variant="ghost" size="sm" to="/dashboard/profil" className="mt-3 -ml-2">
            Kelola Profil →
          </Button>
        </div>

        <div className="rounded-2xl border border-[#E3E0D6] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F6B66]">Reservasi Aktif</span>
            <FileCheck2 className="h-4 w-4 text-[#285C49]" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-[#173F35]">
            {activeCount} Unit
          </p>
          <Button variant="ghost" size="sm" to="/dashboard/reservasi" className="mt-2 -ml-2">
            Lihat Reservasi Saya →
          </Button>
        </div>

        <div className="rounded-2xl border border-[#E3E0D6] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F6B66]">Menunggu Transfer</span>
            <CreditCard className="h-4 w-4 text-[#285C49]" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-[#173F35]">
            {pendingPaymentCount} Tagihan
          </p>
          <Button variant="ghost" size="sm" to="/dashboard/pembayaran" className="mt-2 -ml-2">
            Menu Pembayaran →
          </Button>
        </div>
      </div>

      {latest && (
        <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)] flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#285C49]">
              Reservasi Terbaru Anda
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <code className="font-mono text-xs font-bold text-[#173F35]">
                {latest.reservation_number}
              </code>
              <Badge variant={RESERVATION_STATUS_META[latest.status].variant}>
                {RESERVATION_STATUS_META[latest.status].label}
              </Badge>
            </div>
            <p className="mt-2 font-display text-base font-bold text-[#173F35]">
              Unit {latest.unitCode} — {latest.houseTypeName} ({latest.projectName})
            </p>
            <p className="text-xs text-[#5F6B66]">
              Booking Fee: {formatCurrency(latest.booking_fee)}
            </p>
          </div>
          <Button variant="primary" size="sm" to="/dashboard/reservasi">
            Lihat Detail
            <ArrowRight className="h-3.5 w-3.5 text-[#D8B978]" />
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)] flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-[#285C49] shrink-0 mt-0.5" />
        <div className="text-sm text-[#5F6B66] leading-relaxed">
          <strong className="text-[#173F35]">Proteksi Anti Double-Booking Aktif:</strong>{' '}
          Seluruh pemesanan unit diproses melalui transaksi PostgreSQL terkunci (`SELECT ... FOR UPDATE`)
          sehingga unit yang Anda reservasi tidak dapat dipesan ganda oleh pengguna lain.
        </div>
      </div>
    </div>
  )
}
