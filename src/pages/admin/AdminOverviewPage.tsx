import { ShieldCheck, Layers, User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { getRoleLabel } from '@/types/auth'

export function AdminOverviewPage() {
  const { user, isSupabaseAuth } = useAuth()

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-8 shadow-[var(--shadow-card)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="forest">
              <ShieldCheck className="h-3.5 w-3.5 text-[#D8B978]" />
              RBAC Terverifikasi: {user ? getRoleLabel(user.role) : ''}
            </Badge>
            <Badge variant={isSupabaseAuth ? 'emerald' : 'gold'}>
              {isSupabaseAuth ? 'Supabase Auth Terhubung' : 'Mode Demo Auth (Phase 3)'}
            </Badge>
          </div>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
            Dashboard Administrator PERUMAHAN
          </h1>
          <p className="mt-1.5 text-sm text-[#5F6B66] max-w-2xl">
            Struktur navigasi sidebar 15 modul telah aktif dengan pembatasan menu otomatis
            sesuai peran (Sales, Admin, Super Admin). Modul CRUD lengkap, analitik Recharts,
            verifikasi pembayaran, dan laporan akan diaktifkan pada Phase 4–9.
          </p>
        </div>

        <Button variant="primary" size="md" to="/admin/profil">
          <User className="h-4 w-4 text-[#D8B978]" />
          Kelola Profil Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-[#E3E0D6] bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-[#5F6B66]">Peran Sesi Aktif</p>
          <p className="mt-1.5 font-display text-xl font-bold text-[#173F35]">
            {user ? getRoleLabel(user.role) : '-'}
          </p>
          <p className="mt-1 text-xs text-[#5F6B66]">
            {user?.role === 'super_admin'
              ? 'Akses penuh seluruh 15 modul termasuk Manajemen Administrator & Pengaturan.'
              : user?.role === 'admin'
                ? 'Akses manajemen operasional, verifikasi pembayaran, dan laporan.'
                : 'Akses terbatas ke Unit, Pelanggan, dan Reservasi sesuai penugasan.'}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E3E0D6] bg-white p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-[#5F6B66]">Keamanan Auth</p>
          <p className="mt-1.5 font-display text-xl font-bold text-[#285C49]">
            Server-Side Role Policy
          </p>
          <p className="mt-1 text-xs text-[#5F6B66]">
            Pelanggan tidak dapat meningkatkan peran melalui metadata atau profil.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E3E0D6] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#5F6B66]">Tahap Selanjutnya</p>
            <Layers className="h-4 w-4 text-[#D8B978]" />
          </div>
          <p className="mt-1.5 font-display text-xl font-bold text-[#173F35]">
            Phase 4: Database &amp; RLS
          </p>
          <p className="mt-1 text-xs text-[#5F6B66]">
            Migrasi SQL 12 tabel PostgreSQL, RPC locking reservasi, Storage bucket &amp; RLS.
          </p>
        </div>
      </div>
    </div>
  )
}
