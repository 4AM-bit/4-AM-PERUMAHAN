import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Clock, Loader2, Save, Settings, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { dashboardService } from '@/services/dashboardService'

const settingsSchema = z.object({
  reservationExpiryHours: z.coerce
    .number()
    .int('Harus berupa bilangan bulat jam.')
    .min(1, 'Minimal 1 jam.')
    .max(168, 'Maksimal 168 jam (7 hari).'),
  officeName: z.string().trim().min(3, 'Nama kantor minimal 3 karakter.'),
  whatsapp: z.string().trim().min(9, 'Nomor WhatsApp tidak valid.'),
  email: z.string().trim().email('Alamat email tidak valid.'),
  address: z.string().trim().min(10, 'Alamat minimal 10 karakter.'),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export function AdminSettingsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      reservationExpiryHours: 24,
      officeName: '',
      whatsapp: '',
      email: '',
      address: '',
    },
  })

  useEffect(() => {
    void dashboardService
      .getSystemSettings()
      .then((data) => {
        form.reset(data)
      })
      .finally(() => setIsLoading(false))
  }, [form])

  const onSubmit = async (values: SettingsFormValues) => {
    if (!user) return
    try {
      await dashboardService.updateSystemSettings(values, {
        id: user.id,
        role: user.role,
      })
      showToast({
        variant: 'success',
        title: 'Pengaturan Sistem Disimpan',
        description: `Masa berlaku penguncian reservasi kini ${values.reservationExpiryHours} jam.`,
      })
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Gagal Menyimpan Pengaturan',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan.',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#173F35]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="forest">
            <ShieldCheck className="h-3.5 w-3.5 text-[#D8B978]" />
            Super Admin Only
          </Badge>
        </div>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#173F35]">
          Pengaturan Sistem PERUMAHAN
        </h1>
        <p className="mt-1 text-sm text-[#5F6B66]">
          Konfigurasi masa berlaku penguncian reservasi unit dan informasi resmi Marketing
          Gallery yang tersimpan pada tabel <code>app_settings</code>.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="rounded-2xl border border-[#E3E0D6] bg-white p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-6"
      >
        <div className="space-y-4 pb-6 border-b border-[#E3E0D6]">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-[#285C49]" />
            <h2 className="font-display text-base font-bold text-[#173F35]">
              Konfigurasi Masa Berlaku Reservasi
            </h2>
          </div>

          <div className="max-w-xs">
            <label
              htmlFor="set-expiry"
              className="block text-xs font-semibold text-[#173F35] mb-1.5"
            >
              Durasi Penguncian Unit Sementara (Jam)
            </label>
            <input
              id="set-expiry"
              type="number"
              min={1}
              max={168}
              {...form.register('reservationExpiryHours')}
              className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3.5 text-sm font-bold text-[#173F35] focus:border-[#173F35] focus:bg-white focus:outline-none"
            />
            {form.formState.errors.reservationExpiryHours && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.reservationExpiryHours.message}
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-[#5F6B66]">
              Rekomendasi standar developer: 24 jam atau 48 jam sebelum unit dilepas otomatis.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Settings className="h-5 w-5 text-[#285C49]" />
            <h2 className="font-display text-base font-bold text-[#173F35]">
              Identitas &amp; Kontak Resmi Developer
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="set-office" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                Nama Kantor Pemasaran
              </label>
              <input
                id="set-office"
                type="text"
                {...form.register('officeName')}
                className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3.5 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none"
              />
              {form.formState.errors.officeName && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.officeName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="set-wa" className="block text-xs font-semibold text-[#173F35] mb-1.5">
                Nomor WhatsApp Resmi (Format 628...)
              </label>
              <input
                id="set-wa"
                type="text"
                {...form.register('whatsapp')}
                className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3.5 text-sm font-mono focus:border-[#173F35] focus:bg-white focus:outline-none"
              />
              {form.formState.errors.whatsapp && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.whatsapp.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="set-email" className="block text-xs font-semibold text-[#173F35] mb-1.5">
              Email Resmi Developer
            </label>
            <input
              id="set-email"
              type="email"
              {...form.register('email')}
              className="h-11 w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 px-3.5 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="set-addr" className="block text-xs font-semibold text-[#173F35] mb-1.5">
              Alamat Marketing Gallery
            </label>
            <textarea
              id="set-addr"
              rows={3}
              {...form.register('address')}
              className="w-full rounded-xl border border-[#E3E0D6] bg-[#F5F4EF]/50 p-3 text-sm focus:border-[#173F35] focus:bg-white focus:outline-none"
            />
            {form.formState.errors.address && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.address.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={form.formState.isSubmitting}
        >
          <Save className="h-4 w-4 text-[#D8B978]" />
          {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan Sistem'}
        </Button>
      </form>
    </div>
  )
}
