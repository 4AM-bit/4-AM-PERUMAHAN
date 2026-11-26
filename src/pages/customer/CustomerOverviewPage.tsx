import { ArrowRight, CheckCircle2, CreditCard, FileCheck2, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'

export function CustomerOverviewPage() {
  const { user } = useAuth()

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
            Kelola profil identitas Anda, pantau status reservasi unit, dan unggah bukti
            transfer pembayaran melalui portal pelanggan ini.
          </p>
        </div>
        <Button variant="gold" size="md" to="/katalog">
          Cari &amp; Pilih Unit
          <ArrowRight className="h-4 w-4" />
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
          <p className="mt-2 font-display text-2xl font-bold text-[#173F35]">0 Unit</p>
          <p className="mt-1 text-xs text-[#5F6B66]">
            Alur reservasi &amp; penguncian unit diaktifkan pada Phase 6.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E3E0D6] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5F6B66]">Pembayaran</span>
            <CreditCard className="h-4 w-4 text-[#285C49]" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-[#173F35]">Terverifikasi</p>
          <p className="mt-1 text-xs text-[#5F6B66]">
            Upload bukti transfer manual diaktifkan pada Phase 7.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)] flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-[#285C49] shrink-0 mt-0.5" />
        <div className="text-sm text-[#5F6B66] leading-relaxed">
          <strong className="text-[#173F35]">Isolasi Data Pelanggan Aktif:</strong> Anda
          masuk dengan peran <code className="font-semibold text-[#173F35]">{user?.role}</code>.
          Route Guard memastikan Anda hanya dapat mengakses portal pelanggan dan tidak dapat
          mengakses rute administrator (`/admin`).
        </div>
      </div>
    </div>
  )
}
