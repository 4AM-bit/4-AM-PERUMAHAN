import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getDefaultRouteForRole } from '@/types/auth'

export function GuestRoute() {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-[#F5F4EF]">
        <Loader2 className="h-8 w-8 animate-spin text-[#173F35]" />
        <p className="text-sm font-medium text-[#5F6B66]">Memuat...</p>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  return <Outlet />
}
