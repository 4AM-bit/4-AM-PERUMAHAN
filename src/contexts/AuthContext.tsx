import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { IS_SUPABASE_CONFIGURED } from '@/lib/config'
import { supabase } from '@/supabase/client'
import { authService } from '@/services/authService'
import type {
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
  UserProfile,
} from '@/types/auth'

interface AuthContextValue {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  isSupabaseAuth: boolean
  loginCustomer: (input: LoginInput) => Promise<UserProfile>
  loginAdmin: (input: LoginInput) => Promise<UserProfile>
  registerCustomer: (input: RegisterInput) => Promise<{
    profile: UserProfile | null
    requiresEmailConfirmation: boolean
  }>
  logout: () => Promise<void>
  updateProfile: (input: UpdateProfileInput) => Promise<UserProfile>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const current = await authService.getCurrentUser()
      setUser(current)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()

    if (IS_SUPABASE_CONFIGURED && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) {
          setUser(null)
          setIsLoading(false)
          return
        }
        void refreshUser()
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [refreshUser])

  const loginCustomer = useCallback(async (input: LoginInput) => {
    const profile = await authService.login(input, 'customer')
    setUser(profile)
    return profile
  }, [])

  const loginAdmin = useCallback(async (input: LoginInput) => {
    const profile = await authService.login(input, 'admin')
    setUser(profile)
    return profile
  }, [])

  const registerCustomer = useCallback(async (input: RegisterInput) => {
    const result = await authService.registerCustomer(input)
    if (result.profile) {
      setUser(result.profile)
    }
    return result
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      if (!user) {
        throw new Error('Anda belum masuk ke akun.')
      }
      const updated = await authService.updateProfile(user.id, input)
      setUser(updated)
      return updated
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isSupabaseAuth: IS_SUPABASE_CONFIGURED,
      loginCustomer,
      loginAdmin,
      registerCustomer,
      logout,
      updateProfile,
      refreshUser,
    }),
    [
      user,
      isLoading,
      loginCustomer,
      loginAdmin,
      registerCustomer,
      logout,
      updateProfile,
      refreshUser,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider')
  }
  return ctx
}
