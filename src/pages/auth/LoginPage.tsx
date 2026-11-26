import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowRight,
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
import { cn } from '@/utils/cn'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const { loginCustomer } = useAuth()
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
      const profile = await loginCustomer(values)
      showToast({
        variant: 'success',
        title: `Selamat datang, ${profile.fullName}`,
        description: 'Anda berhasil masuk ke Portal Pelanggan PERUMAHAN.',
      })
      navigate(fromPath && fromPath.startsWith('/dashboard') ? fromPath : '/dashboard', {
        replace: true,
      })
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Gagal masuk ke akun.')
    }
  }

  const fillDemoCustomer = () => {
    setValue('email', 'pelanggan@perumahan.co.id', { shouldValidate: true })
    setValue('password', 'Demo1234!', { shouldValidate: true })
    setAuthError(null)
  }

  return (
    <section className="py-12 lg:py-20 bg-[#F5F4EF]">
      <div className="container-app">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#E3E0D6] bg-white shadow-[var(--shadow-card)] grid grid-cols-1 lg:grid-cols-12">
          {/* Left Architectural Visual Panel */}
          <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between bg-[#173F35] p-9 text-white">
            <img
              src="/images/hero-residence.jpg"
              alt="PERUMAHAN Residence"
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="relative z-10">
              <BrandLogo light showSubtitle />
            </div>

            <div className="relative z-10 space-y-4">
              <Badge variant="gold" className="bg-[#D8B978]/20 text-[#EFE3C6] border-[#D8B978]/40">
                <ShieldCheck className="h-3.5 w-3.5" />
                Portal Pelanggan Terproteksi
              </Badge>
              <h2 className="font-display text-2xl font-bold leading-snug">
                Pantau Reservasi Unit &amp; Verifikasi Pembayaran Anda dalam Satu Tempat
              </h2>
              <p className="text-sm leading-relaxed text-white/75">
                Akses nomor reservasi, unggah bukti transfer bank secara aman, dan
                dapatkan pembaruan status real-time langsung dari tim kami.
              </p>
            </div>

            <div className="relative z-10 border-t border-white/15 pt-4 text-xs text-white/65">
              Akun internal (Sales/Admin)?{' '}
              <Link
                to="/admin/login"
                className="font-semibold text-[#D8B978] hover:underline"
              >
                Masuk Portal Administrator →
              </Link>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-7 sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
                  Portal Pelanggan
                </p>
                <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
                  Masuk ke Akun Anda
                </h1>
              </div>
              {IS_DEMO_MODE && <Badge variant="gold">Mode Demo Auth</Badge>}
            </div>

            <p className="mt-2 text-sm text-[#5F6B66]">
              Belum memiliki akun pelanggan?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#173F35] underline underline-offset-4 hover:text-[#285C49]"
              >
                Daftar sekarang
              </Link>
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
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-[#173F35] mb-1.5"
                >
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
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
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-[#173F35]"
                  >
                    Kata Sandi
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-[#285C49] hover:text-[#173F35] hover:underline"
                  >
                    Lupa kata sandi?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi"
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
                {isSubmitting ? 'Memverifikasi...' : 'Masuk ke Portal Pelanggan'}
                <ArrowRight className="h-4 w-4 text-[#D8B978]" />
              </Button>
            </form>

            {IS_DEMO_MODE && (
              <div className="mt-6 rounded-2xl border border-[#D8B978]/50 bg-[#FAF7EF] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#173F35]">
                    <Sparkles className="h-3.5 w-3.5 text-[#B5924C]" />
                    Akun Demo Pelanggan (Phase 3)
                  </div>
                  <button
                    type="button"
                    onClick={fillDemoCustomer}
                    className="rounded-lg bg-[#173F35] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#102D26] cursor-pointer"
                  >
                    Isi Otomatis
                  </button>
                </div>
                <p className="mt-2 text-xs text-[#5F6B66]">
                  Email: <code className="font-semibold text-[#173F35]">pelanggan@perumahan.co.id</code>{' '}
                  • Sandi: <code className="font-semibold text-[#173F35]">Demo1234!</code>
                </p>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-[#E3E0D6] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5F6B66]">
              <span>Masuk sebagai tim internal developer?</span>
              <Link
                to="/admin/login"
                className="font-semibold text-[#173F35] hover:text-[#285C49]"
              >
                Portal Administrator →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
