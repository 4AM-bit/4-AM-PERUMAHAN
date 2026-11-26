import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Building2,
  CreditCard,
  FileCheck2,
  Home,
  Image,
  Landmark,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Trees,
  User,
  Users,
  X,
} from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { DemoBanner } from '@/components/common/DemoBanner'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { getRoleLabel, type UserRole } from '@/types/auth'
import { cn } from '@/utils/cn'

interface AdminNavItem {
  label: string
  to: string
  icon: typeof LayoutDashboard
  roles: UserRole[]
  end?: boolean
}

const adminNavItems: AdminNavItem[] = [
  { label: 'Dashboard Overview', to: '/admin', icon: LayoutDashboard, roles: ['sales', 'admin', 'super_admin'], end: true },
  { label: 'Manajemen Proyek', to: '/admin/proyek', icon: Building2, roles: ['admin', 'super_admin'] },
  { label: 'Manajemen Tipe Rumah', to: '/admin/tipe-rumah', icon: Layers, roles: ['admin', 'super_admin'] },
  { label: 'Manajemen Unit', to: '/admin/unit', icon: Home, roles: ['sales', 'admin', 'super_admin'] },
  { label: 'Manajemen Pelanggan', to: '/admin/pelanggan', icon: Users, roles: ['sales', 'admin', 'super_admin'] },
  { label: 'Manajemen Reservasi', to: '/admin/reservasi', icon: FileCheck2, roles: ['sales', 'admin', 'super_admin'] },
  { label: 'Verifikasi Pembayaran', to: '/admin/pembayaran', icon: CreditCard, roles: ['admin', 'super_admin'] },
  { label: 'Manajemen Rekening', to: '/admin/rekening', icon: Landmark, roles: ['admin', 'super_admin'] },
  { label: 'Manajemen Banner', to: '/admin/banner', icon: Image, roles: ['admin', 'super_admin'] },
  { label: 'Manajemen Galeri', to: '/admin/galeri', icon: Image, roles: ['admin', 'super_admin'] },
  { label: 'Manajemen Fasilitas', to: '/admin/fasilitas', icon: Trees, roles: ['admin', 'super_admin'] },
  { label: 'Manajemen Administrator', to: '/admin/administrator', icon: ShieldCheck, roles: ['super_admin'] },
  { label: 'Laporan', to: '/admin/laporan', icon: BarChart3, roles: ['admin', 'super_admin'] },
  { label: 'Activity Logs', to: '/admin/logs', icon: Activity, roles: ['admin', 'super_admin'] },
  { label: 'Pengaturan', to: '/admin/pengaturan', icon: Settings, roles: ['super_admin'] },
  { label: 'Profil Saya', to: '/admin/profil', icon: User, roles: ['sales', 'admin', 'super_admin'] },
]

export function AdminShellLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const allowedNav = adminNavItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  )

  const handleLogout = async () => {
    await logout()
    showToast({
      variant: 'info',
      title: 'Sesi Staff Diakhiri',
      description: 'Anda telah keluar dari Portal Administrator.',
    })
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4EF]">
      <DemoBanner />

      <div className="flex flex-1">
        {/* Desktop Admin Sidebar */}
        <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-[#173F35] text-white">
          <div className="h-20 flex items-center px-6 border-b border-white/10">
            <BrandLogo light showSubtitle />
          </div>

          <div className="px-6 py-4 border-b border-white/10 bg-[#102D26]/60">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-sm font-bold text-white truncate">
                {user?.fullName}
              </p>
              {user && (
                <Badge
                  variant="gold"
                  className="bg-[#D8B978]/20 text-[#EFE3C6] border-[#D8B978]/40 text-[10px] px-2 py-0.5 shrink-0"
                >
                  {getRoleLabel(user.role)}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-white/65 truncate">{user?.email}</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-3.5 space-y-1">
            {allowedNav.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-[#D8B978] text-[#173F35] font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-3.5 border-t border-white/10 space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white/75 hover:bg-white/10 hover:text-white"
            >
              <Home className="h-4 w-4" />
              Lihat Website Publik
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-red-300 hover:bg-red-500/15 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden sticky top-0 z-30 h-16 bg-[#173F35] px-4 flex items-center justify-between text-white">
            <BrandLogo light />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Menu administrator"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </header>

          {mobileMenuOpen && (
            <div className="lg:hidden bg-[#173F35] text-white p-4 space-y-1 border-b border-white/10">
              {allowedNav.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium',
                      isActive ? 'bg-[#D8B978] text-[#173F35] font-semibold' : 'text-white/80',
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
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-red-300"
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
