import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Lock, Save, ShieldCheck, User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { authService } from '@/services/authService'
import {
  profileSchema,
  resetPasswordSchema,
  type ProfileFormValues,
  type ResetPasswordFormValues,
} from '@/schemas/authSchema'
import { getRoleLabel } from '@/types/auth'
import { cn } from '@/utils/cn'

export function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const [passwordSaved, setPasswordSaved] = useState(false)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: user?.fullName ?? '',
      phone: user?.phone ?? '',
      nik: user?.nik ?? '',
      address: user?.address ?? '',
    },
  })

  const passwordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  if (!user) return null

  const onSaveProfile = async (values: ProfileFormValues) => {
    try {
      await updateProfile(values)
      showToast({
        variant: 'success',
        title: 'Profil Berhasil Diperbarui',
        description: 'Perubahan data identitas Anda telah disimpan.',
      })
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Gagal Menyimpan Profil',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan.',
      })
    }
  }

  const onChangePassword = async (values: ResetPasswordFormValues) => {
    try {
      await authService.resetPassword(values.password, user.email)
      passwordForm.reset()
      setPasswordSaved(true)
      showToast({
        variant: 'success',
        title: 'Kata Sandi Diperbarui',
        description: 'Kata sandi akun Anda telah diganti dengan aman.',
      })
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Gagal Mengubah Kata Sandi',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#285C49]">
          Manajemen Akun
        </p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
          Profil &amp; Keamanan Akun
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Form */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-7 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E3E0D6]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#173F35] text-[#D8B978]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-[#173F35]">
                  Informasi Identitas
                </h2>
                <p className="text-xs text-[#5F6B66]">
                  Digunakan sebagai data dasar saat pembuatan reservasi unit.
                </p>
              </div>
            </div>
            <Badge variant="emerald">{getRoleLabel(user.role)}</Badge>
          </div>

          <form
            onSubmit={profileForm.handleSubmit(onSaveProfile)}
            noValidate
            className="mt-6 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5F6B66] mb-1.5">
                  Email (Tidak Dapat Diubah)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF] px-3.5 text-sm text-[#5F6B66] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5F6B66] mb-1.5">
                  Peran Akses (Dikelola Server)
                </label>
                <div className="flex h-11 items-center justify-between rounded-xl border border-[#E3E0D6] bg-[#F5F4EF] px-3.5 text-sm text-[#173F35] font-semibold">
                  <span>{getRoleLabel(user.role)}</span>
                  <Lock className="h-3.5 w-3.5 text-[#5F6B66]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="prof-name"
                  className="block text-xs font-semibold text-[#173F35] mb-1.5"
                >
                  Nama Lengkap
                </label>
                <input
                  id="prof-name"
                  type="text"
                  {...profileForm.register('fullName')}
                  className={cn(
                    'h-11 w-full rounded-xl border bg-[#F5F4EF]/40 px-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2',
                    profileForm.formState.errors.fullName
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                  )}
                />
                {profileForm.formState.errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">
                    {profileForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="prof-phone"
                  className="block text-xs font-semibold text-[#173F35] mb-1.5"
                >
                  Nomor WhatsApp
                </label>
                <input
                  id="prof-phone"
                  type="tel"
                  {...profileForm.register('phone')}
                  className={cn(
                    'h-11 w-full rounded-xl border bg-[#F5F4EF]/40 px-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2',
                    profileForm.formState.errors.phone
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                  )}
                />
                {profileForm.formState.errors.phone && (
                  <p className="mt-1 text-xs text-red-600">
                    {profileForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="prof-nik"
                className="block text-xs font-semibold text-[#173F35] mb-1.5"
              >
                Nomor Induk Kependudukan (NIK — 16 Digit)
              </label>
              <input
                id="prof-nik"
                type="text"
                maxLength={16}
                placeholder="367401XXXXXXXXXX"
                {...profileForm.register('nik')}
                className={cn(
                  'h-11 w-full rounded-xl border bg-[#F5F4EF]/40 px-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2',
                  profileForm.formState.errors.nik
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-[#E3E0D6] focus:border-[#173F35] focus:ring-[#173F35]/15',
                )}
              />
              {profileForm.formState.errors.nik && (
                <p className="mt-1 text-xs text-red-600">
                  {profileForm.formState.errors.nik.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="prof-address"
                className="block text-xs font-semibold text-[#173F35] mb-1.5"
              >
                Alamat Domisili
              </label>
              <textarea
                id="prof-address"
                rows={3}
                placeholder="Alamat lengkap sesuai KTP / domisili saat ini"
                {...profileForm.register('address')}
                className="w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/40 p-3.5 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
              />
              {profileForm.formState.errors.address && (
                <p className="mt-1 text-xs text-red-600">
                  {profileForm.formState.errors.address.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={profileForm.formState.isSubmitting}
            >
              <Save className="h-4 w-4 text-[#D8B978]" />
              {profileForm.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </Button>
          </form>
        </div>

        {/* Security / Change Password Card */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-[#E3E0D6] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E3E0D6]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173F35]/10 text-[#173F35]">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[#173F35]">
                  Ubah Kata Sandi
                </h2>
                <p className="text-xs text-[#5F6B66]">
                  Perbarui kata sandi secara berkala untuk keamanan akun.
                </p>
              </div>
            </div>

            <form
              onSubmit={passwordForm.handleSubmit(onChangePassword)}
              noValidate
              className="mt-5 space-y-4"
            >
              <div>
                <label
                  htmlFor="chg-pass"
                  className="block text-xs font-semibold text-[#173F35] mb-1.5"
                >
                  Kata Sandi Baru
                </label>
                <input
                  id="chg-pass"
                  type="password"
                  placeholder="Min. 8 karakter, kapital & angka"
                  {...passwordForm.register('password')}
                  className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/40 px-3.5 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                />
                {passwordForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="chg-confirm"
                  className="block text-xs font-semibold text-[#173F35] mb-1.5"
                >
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  id="chg-confirm"
                  type="password"
                  placeholder="Ulangi kata sandi baru"
                  {...passwordForm.register('confirmPassword')}
                  className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/40 px-3.5 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#173F35]/15"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {passwordSaved && (
                <p className="text-xs font-medium text-[#285C49]">
                  Kata sandi Anda telah berhasil diperbarui.
                </p>
              )}

              <Button
                type="submit"
                variant="outline"
                size="md"
                disabled={passwordForm.formState.isSubmitting}
                className="w-full"
              >
                {passwordForm.formState.isSubmitting
                  ? 'Memperbarui...'
                  : 'Perbarui Kata Sandi'}
              </Button>
            </form>
          </div>

          <div className="rounded-2xl border border-[#285C49]/20 bg-[#173F35] p-5 text-white text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 font-display font-bold text-[#D8B978]">
              <ShieldCheck className="h-4 w-4" />
              Proteksi Hak Akses (RBAC)
            </div>
            <p className="text-white/80">
              Hak akses akun ditentukan sepenuhnya melalui tabel server{' '}
              <code className="text-[#EFE3C6]">public.profiles</code> yang dilindungi
              Row Level Security (RLS), bukan dari metadata sisi klien.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
