import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { IS_SUPABASE_CONFIGURED } from '@/lib/config'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Client Supabase hanya menggunakan ANON KEY publik.
 * Service role key dilarang keras berada di kode frontend.
 */
export const supabase: SupabaseClient | null =
  IS_SUPABASE_CONFIGURED && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null
