export const IS_SUPABASE_CONFIGURED = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !String(import.meta.env.VITE_SUPABASE_URL).includes('your-project-id'),
)

export const IS_DEMO_MODE = !IS_SUPABASE_CONFIGURED

export const APP_CONFIG = {
  brandName: '4 AM PERUMAHAN',
  legalName: 'PT Perumahan Nusantara Properti',
  tagline: 'Hunian Modern Bernilai Tinggi dengan Sistem Reservasi Transparan',
  phone: '+62 21 5088 9400',
  whatsapp: '6281294008800',
  whatsappDisplay: '+62 812-9400-8800',
  email: 'halo@perumahan.co.id',
  officeAddress:
    'Marketing Gallery PERUMAHAN, Jl. Boulevard Hijau Kav. 18, BSD City, Tangerang Selatan 15345',
  officeHours: 'Senin – Minggu, 09.00 – 18.00 WIB',
} as const
