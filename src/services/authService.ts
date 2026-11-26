import { IS_SUPABASE_CONFIGURED } from '@/lib/config'
import { supabase } from '@/supabase/client'
import {
  isStaffRole,
  type LoginInput,
  type RegisterInput,
  type UpdateProfileInput,
  type UserProfile,
  type UserRole,
} from '@/types/auth'

interface DemoStoredAccount {
  profile: UserProfile
  password: string
}

const DEMO_ACCOUNTS_KEY = 'perumahan_demo_accounts_v1'
const DEMO_SESSION_KEY = 'perumahan_demo_session_v1'

export const SEEDED_DEMO_ACCOUNTS: DemoStoredAccount[] = [
  {
    password: 'Demo1234!',
    profile: {
      id: 'demo-customer-001',
      email: 'pelanggan@perumahan.co.id',
      fullName: 'Arif Budiman',
      phone: '081234567890',
      nik: '3674011205920004',
      address: 'Jl. Melati Indah No. 12, Serpong, Tangerang Selatan',
      role: 'customer',
      isActive: true,
      createdAt: '2026-01-10T08:00:00.000Z',
      updatedAt: '2026-01-10T08:00:00.000Z',
    },
  },
  {
    password: 'Sales1234!',
    profile: {
      id: 'demo-sales-001',
      email: 'sales@perumahan.co.id',
      fullName: 'Nadia Kusuma',
      phone: '081294008811',
      nik: '',
      address: 'Marketing Gallery BSD City',
      role: 'sales',
      isActive: true,
      createdAt: '2026-01-05T08:00:00.000Z',
      updatedAt: '2026-01-05T08:00:00.000Z',
    },
  },
  {
    password: 'Admin1234!',
    profile: {
      id: 'demo-admin-001',
      email: 'admin@perumahan.co.id',
      fullName: 'Raka Mahendra',
      phone: '081294008822',
      nik: '',
      address: 'Head Office PERUMAHAN, BSD City',
      role: 'admin',
      isActive: true,
      createdAt: '2026-01-02T08:00:00.000Z',
      updatedAt: '2026-01-02T08:00:00.000Z',
    },
  },
  {
    password: 'Super1234!',
    profile: {
      id: 'demo-superadmin-001',
      email: 'superadmin@perumahan.co.id',
      fullName: 'Hendra Wijaya',
      phone: '081294008800',
      nik: '',
      address: 'Head Office PERUMAHAN, BSD City',
      role: 'super_admin',
      isActive: true,
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
    },
  },
]

function loadDemoAccounts(): DemoStoredAccount[] {
  try {
    const raw = localStorage.getItem(DEMO_ACCOUNTS_KEY)
    if (!raw) {
      localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(SEEDED_DEMO_ACCOUNTS))
      return [...SEEDED_DEMO_ACCOUNTS]
    }
    return JSON.parse(raw) as DemoStoredAccount[]
  } catch {
    return [...SEEDED_DEMO_ACCOUNTS]
  }
}

function saveDemoAccounts(accounts: DemoStoredAccount[]) {
  localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts))
}

function getDemoSessionUserId(): string | null {
  try {
    return localStorage.getItem(DEMO_SESSION_KEY)
  } catch {
    return null
  }
}

function setDemoSessionUserId(userId: string | null) {
  if (userId) {
    localStorage.setItem(DEMO_SESSION_KEY, userId)
  } else {
    localStorage.removeItem(DEMO_SESSION_KEY)
  }
}

function normalizeRole(value: unknown): UserRole {
  if (
    value === 'customer' ||
    value === 'sales' ||
    value === 'admin' ||
    value === 'super_admin'
  ) {
    return value
  }
  return 'customer'
}

interface DbProfileRow {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  nik: string | null
  address: string | null
  role: string
  is_active: boolean | null
  created_at: string
  updated_at: string
}

function mapDbProfile(row: DbProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name ?? '',
    phone: row.phone ?? '',
    nik: row.nik ?? '',
    address: row.address ?? '',
    role: normalizeRole(row.role),
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Mengambil profil & role HANYA dari tabel server `public.profiles`
 * (dilindungi RLS PostgreSQL) dan BUKAN dari `user_metadata` yang
 * dapat dimodifikasi pengguna di sisi klien.
 */
async function fetchSupabaseProfile(userId: string): Promise<UserProfile> {
  if (!supabase) {
    throw new Error('Supabase client belum terkonfigurasi.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, nik, address, role, is_active, created_at, updated_at')
    .eq('id', userId)
    .single<DbProfileRow>()

  if (error || !data) {
    throw new Error(
      'Profil akun belum ditemukan pada tabel profiles. Pastikan migrasi database Phase 4 telah dijalankan.',
    )
  }

  if (data.is_active === false) {
    await supabase.auth.signOut()
    throw new Error('Akun Anda sedang dinonaktifkan. Hubungi administrator.')
  }

  return mapDbProfile(data)
}

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) return null
      return fetchSupabaseProfile(session.user.id)
    }

    const userId = getDemoSessionUserId()
    if (!userId) return null
    const account = loadDemoAccounts().find((acc) => acc.profile.id === userId)
    return account?.profile ?? null
  },

  async login(
    input: LoginInput,
    portal: 'customer' | 'admin',
  ): Promise<UserProfile> {
    const email = input.email.trim().toLowerCase()

    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: input.password,
      })

      if (error || !data.user) {
        throw new Error('Email atau kata sandi tidak sesuai.')
      }

      const profile = await fetchSupabaseProfile(data.user.id)

      if (portal === 'admin' && !isStaffRole(profile.role)) {
        await supabase.auth.signOut()
        throw new Error(
          'Akun pelanggan tidak memiliki akses ke Portal Administrator. Silakan masuk melalui Login Pelanggan.',
        )
      }

      if (portal === 'customer' && isStaffRole(profile.role)) {
        await supabase.auth.signOut()
        throw new Error(
          'Akun internal (Sales/Admin) silakan masuk melalui Portal Administrator.',
        )
      }

      return profile
    }

    await new Promise((resolve) => setTimeout(resolve, 350))
    const accounts = loadDemoAccounts()
    const match = accounts.find(
      (acc) =>
        acc.profile.email.toLowerCase() === email &&
        acc.password === input.password,
    )

    if (!match) {
      throw new Error('Email atau kata sandi tidak sesuai.')
    }

    if (!match.profile.isActive) {
      throw new Error('Akun Anda sedang dinonaktifkan.')
    }

    if (portal === 'admin' && !isStaffRole(match.profile.role)) {
      throw new Error(
        'Akun pelanggan tidak memiliki akses ke Portal Administrator. Silakan masuk melalui Login Pelanggan.',
      )
    }

    if (portal === 'customer' && isStaffRole(match.profile.role)) {
      throw new Error(
        'Akun internal (Sales/Admin) silakan masuk melalui Portal Administrator.',
      )
    }

    setDemoSessionUserId(match.profile.id)
    return match.profile
  },

  /**
   * Registrasi publik SELALU membuat role `customer`.
   * Tidak pernah menerima parameter role dari client.
   */
  async registerCustomer(input: RegisterInput): Promise<{
    profile: UserProfile | null
    requiresEmailConfirmation: boolean
  }> {
    const email = input.email.trim().toLowerCase()

    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName.trim(),
            phone: input.phone.trim(),
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.session || !data.user) {
        return { profile: null, requiresEmailConfirmation: true }
      }

      const profile = await fetchSupabaseProfile(data.user.id)
      return { profile, requiresEmailConfirmation: false }
    }

    await new Promise((resolve) => setTimeout(resolve, 400))
    const accounts = loadDemoAccounts()
    if (accounts.some((acc) => acc.profile.email.toLowerCase() === email)) {
      throw new Error('Email sudah terdaftar. Silakan masuk atau gunakan email lain.')
    }

    const now = new Date().toISOString()
    const newAccount: DemoStoredAccount = {
      password: input.password,
      profile: {
        id: `demo-customer-${Date.now()}`,
        email,
        fullName: input.fullName.trim(),
        phone: input.phone.trim(),
        nik: '',
        address: '',
        role: 'customer',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    }

    saveDemoAccounts([...accounts, newAccount])
    setDemoSessionUserId(newAccount.profile.id)
    return { profile: newAccount.profile, requiresEmailConfirmation: false }
  },

  async logout(): Promise<void> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      await supabase.auth.signOut()
      return
    }
    setDemoSessionUserId(null)
  },

  async requestPasswordReset(emailInput: string): Promise<{ demoResetReady: boolean }> {
    const email = emailInput.trim().toLowerCase()

    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) {
        throw new Error(error.message)
      }
      return { demoResetReady: false }
    }

    await new Promise((resolve) => setTimeout(resolve, 350))
    return { demoResetReady: true }
  },

  async resetPassword(newPassword: string, demoEmail?: string): Promise<void> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) {
        throw new Error(error.message)
      }
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 350))
    const accounts = loadDemoAccounts()
    const activeId = getDemoSessionUserId()
    const targetEmail = demoEmail?.trim().toLowerCase()

    const updated = accounts.map((acc) => {
      if (
        (activeId && acc.profile.id === activeId) ||
        (targetEmail && acc.profile.email.toLowerCase() === targetEmail)
      ) {
        return { ...acc, password: newPassword }
      }
      return acc
    })

    saveDemoAccounts(updated)
  },

  /**
   * Hanya kolom profil yang diizinkan (fullName, phone, nik, address)
   * yang dapat diperbarui. Kolom `role` dan `isActive` dikunci ketat.
   */
  async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<UserProfile> {
    if (IS_SUPABASE_CONFIGURED && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: input.fullName.trim(),
          phone: input.phone.trim(),
          nik: input.nik.trim() || null,
          address: input.address.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('id, email, full_name, phone, nik, address, role, is_active, created_at, updated_at')
        .single<DbProfileRow>()

      if (error || !data) {
        throw new Error(error?.message ?? 'Gagal memperbarui profil.')
      }

      return mapDbProfile(data)
    }

    await new Promise((resolve) => setTimeout(resolve, 350))
    const accounts = loadDemoAccounts()
    let updatedProfile: UserProfile | null = null

    const nextAccounts = accounts.map((acc) => {
      if (acc.profile.id === userId) {
        updatedProfile = {
          ...acc.profile,
          fullName: input.fullName.trim(),
          phone: input.phone.trim(),
          nik: input.nik.trim(),
          address: input.address.trim(),
          updatedAt: new Date().toISOString(),
        }
        return { ...acc, profile: updatedProfile }
      }
      return acc
    })

    if (!updatedProfile) {
      throw new Error('Akun tidak ditemukan.')
    }

    saveDemoAccounts(nextAccounts)
    return updatedProfile
  },
}
