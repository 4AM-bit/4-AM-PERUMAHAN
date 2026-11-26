import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle2,
  X,
} from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { getDefaultRouteForRole, getRoleLabel } from '@/types/auth'
import { cn } from '@/utils/cn'

const navItems = [
  { label: 'Beranda', to: '/' },
  { label: 'Proyek', to: '/proyek' },
  { label: 'Katalog Rumah', to: '/katalog' },
  { label: 'Fasilitas', to: '/#fasilitas' },
  { label: 'Kontak', to: '/kontak' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const dashboardRoute = user ? getDefaultRouteForRole(user.role) : '/dashboard'

  const handleLogout = async () => {
    await logout()
    setMobileOpen(false)
    showToast({
      variant: 'info',
      title: 'Berhasil Keluar',
      description: 'Anda telah keluar dari akun PERUMAHAN.',
    })
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E3E0D6]/80 bg-[#FFFFFF]/92 backdrop-blur-md">
      <div className="container-app flex h-20 items-center justify-between gap-4">
        <BrandLogo showSubtitle />

        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi utama">
          {navItems.map((item) =>
            item.to.startsWith('/#') ? (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#242B28]/80 transition-colors hover:bg-[#F5F4EF] hover:text-[#173F35]"
              >
                {item.label}
              </Link>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#173F35]/8 text-[#173F35] font-semibold'
                      : 'text-[#242B28]/80 hover:bg-[#F5F4EF] hover:text-[#173F35]',
                  )
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-2.5">
          {isAuthenticated && user ? (
            <>
              <Button variant="outline" size="sm" to={dashboardRoute}>
                <LayoutDashboard className="h-4 w-4 text-[#285C49]" />
                <span className="max-w-[140px] truncate">{user.fullName}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Keluar"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" to="/login">
                <UserCircle2 className="h-4 w-4" />
                Masuk
              </Button>
              <Button variant="primary" size="sm" to="/katalog">
                Jelajahi Rumah
                <ArrowUpRight className="h-4 w-4 text-[#D8B978]" />
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-xl border border-[#E3E0D6] bg-white text-[#173F35] transition-colors hover:bg-[#F5F4EF]"
          aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E3E0D6] bg-white shadow-lg">
          <div className="container-app py-5 flex flex-col gap-1.5">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-[#242B28] transition-colors hover:bg-[#F5F4EF] hover:text-[#173F35]"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-4 pt-4 border-t border-[#E3E0D6] flex flex-col gap-2.5">
              {isAuthenticated && user ? (
                <>
                  <div className="rounded-xl bg-[#F5F4EF] px-4 py-3">
                    <p className="text-xs font-bold text-[#173F35]">{user.fullName}</p>
                    <p className="text-[11px] text-[#5F6B66]">
                      {getRoleLabel(user.role)} • {user.email}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    to={dashboardRoute}
                    onClick={() => setMobileOpen(false)}
                    className="w-full"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#D8B978]" />
                    Buka Portal Saya
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleLogout}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="md"
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full"
                  >
                    <UserCircle2 className="h-4 w-4" />
                    Masuk / Portal Pelanggan
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    to="/katalog"
                    onClick={() => setMobileOpen(false)}
                    className="w-full"
                  >
                    Jelajahi Rumah
                    <ArrowUpRight className="h-4 w-4 text-[#D8B978]" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
