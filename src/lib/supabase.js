import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we're in demo mode
export const isDemoMode = !supabaseUrl || !supabaseAnonKey

console.log('🔧 Supabase Configuration:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isDemoMode,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING'
})

if (isDemoMode) {
  console.warn('⚠️ SUPABASE NOT CONFIGURED: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment variables')
}

export const supabase = isDemoMode ? null : createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signInWithGoogle = async () => {
  if (isDemoMode) {
    return { 
      data: { user: { id: 'demo-user', email: 'demo@example.com' } }, 
      error: null 
    }
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })
  return { data, error }
}

export const signOut = async () => {
  if (isDemoMode) {
    return { error: null }
  }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  if (isDemoMode) {
    return { user: null, error: null }
  }
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}