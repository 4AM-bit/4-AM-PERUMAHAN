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
  headOfficeAddress: 'Alam Sutera, Tangerang, Banten',
  branchOfficeAddress: 'Blang Bintang, Aceh Besar, Aceh',
  officeAddress:
    'Kantor Pusat: Alam Sutera, Tangerang | Kantor Cabang: Blang Bintang, Aceh Besar',
  officeHours: 'Senin – Minggu, 09.00 – 18.00 WIB',
} as const
