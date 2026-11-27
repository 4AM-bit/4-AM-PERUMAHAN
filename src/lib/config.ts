export const IS_SUPABASE_CONFIGURED = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !String(import.meta.env.VITE_SUPABASE_URL).includes('your-project-id'),
)

export const IS_DEMO_MODE = !IS_SUPABASE_CONFIGURED

export const APP_CONFIG = {
  brandName: '4 AM PERUMAHAN',
  legalName: 'PT Abdurrahman Properti',
  tagline: 'Hunian Modern Bernilai Tinggi dengan Sistem Reservasi Transparan',
  phone: '+62 821-7121-8646',
  whatsapp: '6282171218646',
  whatsappDisplay: '+62 821-7121-8646',
  email: 'halo@perumahan.co.id',
  officeAddress:
    'Marketing Gallery PERUMAHAN, Jl. Boulevard Hijau Kav. 18, BSD City, Tangerang Selatan 15345',
  officeHours: 'Senin – Minggu, 09.00 – 18.00 WIB',
} as const
