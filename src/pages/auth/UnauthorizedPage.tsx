import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { getDefaultRouteForRole } from '@/types/auth'

export function UnauthorizedPage() {
  const { user } = useAuth()
  const targetRoute = user ? getDefaultRouteForRole(user.role) : '/'

  return (
    <section className="py-24 bg-[#F5F4EF]">
      <div className="container-app">
        <div className="mx-auto max-w-lg rounded-3xl border border-[#E3E0D6] bg-white p-10 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
            403 • Akses Ditolak
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-[#173F35]">
            Anda tidak memiliki hak akses ke halaman ini
          </h1>
          <p className="mt-3 text-sm text-[#5F6B66] leading-relaxed">
            Halaman ini dilindungi oleh kebijakan kontrol akses berbasis peran (RBAC).
            Silakan kembali ke portal yang sesuai dengan peran akun Anda.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button variant="primary" to={targetRoute}>
              <ArrowLeft className="h-4 w-4 text-[#D8B978]" />
              Kembali ke Portal Saya
            </Button>
            <Button variant="outline" to="/">
              Ke Beranda
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
