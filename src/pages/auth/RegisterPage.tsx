import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { IS_DEMO_MODE } from '@/lib/config'
import { registerSchema, type RegisterFormValues } from '@/schemas/authSchema'
import { cn } from '@/utils/cn'

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null)
  const { registerCustomer } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setAuthError(null)
    try {
      const result = await registerCustomer({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      })

      if (result.requiresEmailConfirmation) {
        setPendingVerificationEmail(values.email)
        return
      }

      showToast({
        variant: 'success',
        title: 'Registrasi Berhasil',
        description: 'Akun pelanggan Anda telah aktif. Selamat datang di PERUMAHAN.',
      })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Gagal mendaftarkan akun.')
    }
  }

  return (
    <section className="py-12 lg:py-16 bg-[#F5F4EF]">
      <div className="container-app">
        <div className="mx-auto max-w-xl rounded-3xl border border-[#E3E0D6] bg-white p-7 sm:p-10 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
                Registrasi Pelanggan
              </p>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
                Buat Akun PERUMAHAN
              </h1>
            </div>
            {IS_DEMO_MODE && <Badge variant="gold">Mode Demo Auth</Badge>}
          </div>

          <p className="mt-2 text-sm text-[#5F6B66]">
            Sudah memiliki akun?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#173F35] underline underline-offset-4 hover:text-[#285C49]"
            >
              Masuk di sini
            </Link>
          </p>

          {pendingVerificationEmail ? (
            <div className="mt-8 rounded-2xl border border-[#285C49]/25 bg-[#F5F4EF] p-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#173F35] text-[#D8B978]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="font-display text-lg font-bold text-[#173F35]">
                Periksa Email Verifikasi Anda
              </h2>
              <p className="text-sm text-[#5F6B66] leading-relaxed">
                Kami telah mengirim tautan konfirmasi ke{' '}
                <strong className="text-[#173F35]">{pendingVerificationEmail}</strong>.
                Silakan klik tautan tersebut untuk mengaktifkan akun pelanggan Anda.
              </p>
              <Button variant="primary" size="sm" to="/login">
                Kembali ke Halaman Login
              </Button>
            </div>
          ) : (
            <>
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
                    htmlFor="reg-name"
                    className="block text-xs font-semibold text-[#173F35] mb-1.5"
                  >
                    Nama Lengkap (Sesuai KTP)
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      {...register('fullName')}
                      className={cn(
                        'h-11 w-full rounded-xl border bg-[#F5F4EF]/50 pl-10 pr-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2',
                        errors.fullName
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                          : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                      )}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="reg-email"
                      className="block text-xs font-semibold text-[#173F35] mb-1.5"
                    >
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                      <input
                        id="reg-email"
                        type="email"
                        placeholder="nama@email.com"
                        {...register('email')}
                        className={cn(
                          'h-11 w-full rounded-xl border bg-[#F5F4EF]/50 pl-10 pr-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2',
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
                    <label
                      htmlFor="reg-phone"
                      className="block text-xs font-semibold text-[#173F35] mb-1.5"
                    >
                      Nomor WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                      <input
                        id="reg-phone"
                        type="tel"
                        placeholder="081234567890"
                        {...register('phone')}
                        className={cn(
                          'h-11 w-full rounded-xl border bg-[#F5F4EF]/50 pl-10 pr-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2',
                          errors.phone
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                            : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                        )}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-xs font-semibold text-[#173F35] mb-1.5"
                    >
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 karakter"
                        {...register('password')}
                        className={cn(
                          'h-11 w-full rounded-xl border bg-[#F5F4EF]/50 pl-10 pr-10 text-sm focus:bg-white focus:outline-none focus:ring-2',
                          errors.password
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                            : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label="Toggle kata sandi"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F6B66] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="reg-confirm"
                      className="block text-xs font-semibold text-[#173F35] mb-1.5"
                    >
                      Konfirmasi Sandi
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                      <input
                        id="reg-confirm"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Ulangi kata sandi"
                        {...register('confirmPassword')}
                        className={cn(
                          'h-11 w-full rounded-xl border bg-[#F5F4EF]/50 pl-10 pr-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2',
                          errors.confirmPassword
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                            : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                        )}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-[#5F6B66]">
                  Gunakan minimal 8 karakter dengan kombinasi huruf kapital dan angka.
                </p>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-[#5F6B66] cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('agreeTerms')}
                      className="mt-0.5 h-4 w-4 rounded border-[#E3E0D6] accent-[#173F35]"
                    />
                    <span>
                      Saya menyetujui ketentuan layanan reservasi unit dan kebijakan
                      privasi data pelanggan PT Perumahan Nusantara Properti.
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="mt-1 text-xs text-red-600">{errors.agreeTerms.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Mendaftarkan Akun...' : 'Daftar sebagai Pelanggan'}
                  <ArrowRight className="h-4 w-4 text-[#D8B978]" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
