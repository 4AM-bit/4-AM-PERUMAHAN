import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/authService'
import { useToast } from '@/contexts/ToastContext'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/schemas/authSchema'

export function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const demoEmail = searchParams.get('email') ?? undefined

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setSubmitError(null)
    try {
      await authService.resetPassword(values.password, demoEmail)
      setDone(true)
      showToast({
        variant: 'success',
        title: 'Kata Sandi Diperbarui',
        description: 'Silakan masuk kembali menggunakan kata sandi baru Anda.',
      })
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Gagal memperbarui kata sandi.',
      )
    }
  }

  return (
    <section className="py-16 lg:py-24 bg-[#F5F4EF]">
      <div className="container-app">
        <div className="mx-auto max-w-md rounded-3xl border border-[#E3E0D6] bg-white p-7 sm:p-9 shadow-[var(--shadow-card)]">
          <div className="mb-6 pb-5 border-b border-[#E3E0D6]">
            <BrandLogo showSubtitle />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
            Keamanan Akun
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-[#173F35]">
            Atur Ulang Kata Sandi
          </h1>

          {done ? (
            <div className="mt-6 rounded-2xl border border-[#285C49]/25 bg-[#F5F4EF] p-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#173F35] text-[#D8B978]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-[#173F35]">
                Kata sandi berhasil diperbarui!
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login', { replace: true })}
              >
                Masuk Sekarang
              </Button>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-[#5F6B66]">
                Buat kata sandi baru minimal 8 karakter dengan kombinasi huruf kapital dan
                angka.
              </p>

              {submitError && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="reset-password"
                    className="block text-xs font-semibold text-[#173F35] mb-1.5"
                  >
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimal 8 karakter"
                      {...register('password')}
                      className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 pl-10 pr-10 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
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
                    htmlFor="reset-confirm"
                    className="block text-xs font-semibold text-[#173F35] mb-1.5"
                  >
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                    <input
                      id="reset-confirm"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Ulangi kata sandi baru"
                      {...register('confirmPassword')}
                      className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 pl-10 pr-3.5 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
                </Button>
              </form>

              <p className="mt-5 text-center text-xs text-[#5F6B66]">
                <Link to="/login" className="font-semibold text-[#173F35] hover:underline">
                  Kembali ke halaman login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
