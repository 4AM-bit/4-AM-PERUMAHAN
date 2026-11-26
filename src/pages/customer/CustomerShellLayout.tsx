import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  CreditCard,
  FileCheck2,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { DemoBanner } from '@/components/common/DemoBanner'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { cn } from '@/utils/cn'

const customerNav = [
  { label: 'Ringkasan Akun', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Profil Saya', to: '/dashboard/profil', icon: User, end: false },
  { label: 'Reservasi Saya', to: '/dashboard/reservasi', icon: FileCheck2, end: false },
  { label: 'Riwayat Pembayaran', to: '/dashboard/pembayaran', icon: CreditCard, end: false },
  { label: 'Notifikasi', to: '/dashboard/notifikasi', icon: Bell, end: false },
]

export function CustomerShellLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    showToast({
      variant: 'info',
      title: 'Anda Telah Keluar',
      description: 'Sesi Portal Pelanggan telah diakhiri dengan aman.',
    })
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4EF]">
      <DemoBanner />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-68 shrink-0 flex-col border-r border-[#E3E0D6] bg-white">
          <div className="h-20 flex items-center px-6 border-b border-[#E3E0D6]">
            <BrandLogo showSubtitle />
          </div>

          <div className="p-4 border-b border-[#E3E0D6] bg-[#FAF9F5]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#285C49]">
              Portal Pelanggan
            </p>
            <p className="mt-0.5 font-display text-sm font-bold text-[#173F35] truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-[#5F6B66] truncate">{user?.email}</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {customerNav.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#173F35] text-white'
                      : 'text-[#242B28]/80 hover:bg-[#F5F4EF] hover:text-[#173F35]',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-[#E3E0D6] space-y-1.5">
            <Link
              to="/katalog"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#285C49] hover:bg-[#F5F4EF]"
            >
              <Home className="h-4 w-4" />
              Jelajahi Katalog Rumah
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </aside>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden sticky top-0 z-30 h-16 border-b border-[#E3E0D6] bg-white px-4 flex items-center justify-between">
            <BrandLogo />
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Menu pelanggan"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E3E0D6] text-[#173F35]"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </header>

          {sidebarOpen && (
            <div className="lg:hidden border-b border-[#E3E0D6] bg-white p-4 space-y-1 shadow-md">
              {customerNav.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium',
                      isActive ? 'bg-[#173F35] text-white' : 'text-[#242B28]',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}

          <main className="flex-1 p-5 sm:p-8 max-w-6xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
