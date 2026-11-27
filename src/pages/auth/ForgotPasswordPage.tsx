import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/authService'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/schemas/authSchema'

export function ForgotPasswordPage() {
  const [sentEmail, setSentEmail] = useState<string | null>(null)
  const [isDemoFlow, setIsDemoFlow] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setSubmitError(null)
    try {
      const res = await authService.requestPasswordReset(values.email)
      setSentEmail(values.email)
      setIsDemoFlow(res.demoResetReady)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Gagal mengirim tautan reset kata sandi.',
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

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#285C49] hover:text-[#173F35]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Login
          </Link>

          <h1 className="mt-4 font-display text-2xl font-extrabold text-[#173F35]">
            Lupa Kata Sandi
          </h1>
          <p className="mt-2 text-sm text-[#5F6B66] leading-relaxed">
            Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan untuk
            mengatur ulang kata sandi akun Anda.
          </p>

          {sentEmail ? (
            <div className="mt-6 rounded-2xl border border-[#285C49]/25 bg-[#F5F4EF] p-5 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#285C49] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-[#242B28]">
                  <p className="font-bold text-[#173F35]">Instruksi Reset Terkirim</p>
                  <p className="mt-1 text-[#5F6B66]">
                    Jika email <strong>{sentEmail}</strong> terdaftar, tautan reset kata sandi
                    telah dikirimkan.
                  </p>
                </div>
              </div>

              {isDemoFlow && (
                <Button
                  variant="primary"
                  size="sm"
                  to={`/reset-password?email=${encodeURIComponent(sentEmail)}`}
                  className="w-full"
                >
                  Lanjut Uji Reset Kata Sandi (Mode Demo)
                </Button>
              )}
            </div>
          ) : (
            <>
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
                    htmlFor="forgot-email"
                    className="block text-xs font-semibold text-[#173F35] mb-1.5"
                  >
                    Alamat Email Terdaftar
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B66]" />
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="nama@email.com"
                      {...register('email')}
                      className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 pl-10 pr-3.5 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Mengirim Tautan...' : 'Kirim Tautan Reset Sandi'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
