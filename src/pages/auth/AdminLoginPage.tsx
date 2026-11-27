import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { IS_DEMO_MODE } from '@/lib/config'
import { loginSchema, type LoginFormValues } from '@/schemas/authSchema'
import { getRoleLabel } from '@/types/auth'
import { cn } from '@/utils/cn'

const DEMO_STAFF_ACCOUNTS = [
  { label: 'Super Admin', email: 'superadmin@perumahan.co.id', pass: 'Super1234!' },
  { label: 'Admin', email: 'admin@perumahan.co.id', pass: 'Admin1234!' },
  { label: 'Sales', email: 'sales@perumahan.co.id', pass: 'Sales1234!' },
] as const

export function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const { loginAdmin } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null)
    try {
      const profile = await loginAdmin(values)
      showToast({
        variant: 'success',
        title: `Login Berhasil (${getRoleLabel(profile.role)})`,
        description: `Selamat bertugas, ${profile.fullName}.`,
      })
      navigate(fromPath && fromPath.startsWith('/admin') ? fromPath : '/admin', {
        replace: true,
      })
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Gagal masuk ke portal admin.')
    }
  }

  return (
    <div className="min-h-screen bg-[#102D26] flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <BrandLogo light showSubtitle />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/75 hover:text-[#D8B978]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Website Publik
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-7 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3.5 mb-2">
            <img
              src="/4am-logo-light.png"
              alt="4 AM PERUMAHAN"
              className="h-12 w-12 object-contain shrink-0 drop-shadow-xs"
            />
            <div className="flex flex-col">
              <Badge variant="forest" className="w-fit">
                <ShieldCheck className="h-3.5 w-3.5 text-[#D8B978]" />
                Akses Terbatas Staff
              </Badge>
              <h1 className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-[#173F35]">
                Portal Administrator
              </h1>
            </div>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[#5F6B66]">
            Khusus Sales, Administrator, dan Super Administrator terotorisasi. Verifikasi
            hak akses dilakukan melalui tabel profil server.
          </p>

          {authError && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-[#173F35] mb-1.5"
              >
                Email Korporat
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@perumahan.co.id"
                  {...register('email')}
                  className={cn(
                    'h-11 w-full rounded-xl border bg-[#F5F4EF]/50 pl-10 pr-3.5 text-sm text-[#242B28] focus:bg-white focus:outline-none focus:ring-2 transition-all',
                    errors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-[#173F35]"
                >
                  Kata Sandi
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#285C49] hover:underline"
                >
                  Lupa sandi?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi staff"
                  {...register('password')}
                  className={cn(
                    'h-11 w-full rounded-xl border bg-[#F5F4EF]/50 pl-10 pr-11 text-sm text-[#242B28] focus:bg-white focus:outline-none focus:ring-2 transition-all',
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                      : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F6B66] hover:text-[#173F35] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Memverifikasi Otoritas...' : 'Masuk Dashboard Administrator'}
            </Button>
          </form>

          {IS_DEMO_MODE && (
            <div className="mt-6 rounded-2xl border border-[#D8B978]/50 bg-[#FAF7EF] p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#173F35]">
                <Sparkles className="h-3.5 w-3.5 text-[#B5924C]" />
                Pilih Akun Demo Staff (Pengujian RBAC)
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_STAFF_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setValue('email', acc.email, { shouldValidate: true })
                      setValue('password', acc.pass, { shouldValidate: true })
                      setAuthError(null)
                    }}
                    className="rounded-lg border border-[#173F35]/20 bg-white px-2.5 py-2 text-[11px] font-semibold text-[#173F35] hover:bg-[#173F35] hover:text-white transition-colors cursor-pointer"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-[#E3E0D6] text-center text-xs text-[#5F6B66]">
            Anda calon pembeli / pelanggan?{' '}
            <Link to="/login" className="font-semibold text-[#173F35] hover:underline">
              Masuk Portal Pelanggan
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
