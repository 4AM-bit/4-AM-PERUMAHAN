import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/auth'

interface ProtectedRouteProps {
  allowedRoles: readonly UserRole[]
  loginPath?: string
}

export function ProtectedRoute({
  allowedRoles,
  loginPath = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-[#F5F4EF]">
        <Loader2 className="h-8 w-8 animate-spin text-[#173F35]" />
        <p className="text-sm font-medium text-[#5F6B66]">
          Memverifikasi sesi akun Anda...
        </p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
