import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 AuthContext initializing...', { isDemoMode })
    
    if (isDemoMode) {
      console.log('🚫 Demo mode active - authentication disabled')
      setLoading(false)
      return
    }

    if (!supabase) {
      console.error('❌ Supabase client is null!')
      setLoading(false)
      return
    }

    // Handle URL fragments from OAuth redirects
    const handleAuthRedirect = async () => {
      const hash = window.location.hash.substring(1)
      if (hash) {
        console.log('🔗 OAuth redirect detected:', hash.substring(0, 50) + '...')
        const hashParams = new URLSearchParams(hash)
        if (hashParams.get('access_token')) {
          console.log('🎫 Access token found in URL')
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      }
    }

    handleAuthRedirect()

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          setUser(null)
        } else if (session?.user) {
          console.log('✅ User authenticated:', session.user.email)
          setUser(session.user)
        } else {
          console.log('👤 No active session')
          setUser(null)
        }
      } catch (error) {
        console.error('💥 Exception getting session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user')
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Clean up URL fragments after auth
        if (event === 'SIGNED_IN' && window.location.hash) {
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    signInWithGoogle: async () => {
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
    },
    signOut: async () => {
      if (isDemoMode) {
        return { error: null }
      }
      const { error } = await supabase.auth.signOut()
      return { error }
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}