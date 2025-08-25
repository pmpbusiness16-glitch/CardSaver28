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

    // Check for OAuth redirect and wait for Supabase to handle it automatically
    const hash = window.location.hash.substring(1)
    if (hash) {
      console.log('🔗 OAuth redirect detected:', hash.substring(0, 50) + '...')
      const hashParams = new URLSearchParams(hash)
      if (hashParams.get('access_token')) {
        console.log('🎫 Access token found - Supabase will process automatically via onAuthStateChange')
      }
    }

    // Get initial session (Supabase handles OAuth automatically)
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          setUser(null)
          setLoading(false)
        } else if (session?.user) {
          console.log('✅ User authenticated:', session.user.email)
          setUser(session.user)
          setLoading(false)
        } else {
          console.log('👤 No active session')
          setUser(null)
          setLoading(false)
        }
      } catch (error) {
        console.error('💥 Exception getting session:', error)
        setUser(null)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user')
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Successfully signed in:', session.user.email)
          setUser(session.user)
          setLoading(false)
          // Clean up URL fragments after successful sign in
          if (window.location.hash) {
            console.log('🧹 Cleaning up URL after successful sign in')
            window.history.replaceState({}, document.title, window.location.pathname)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          setUser(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed for:', session.user.email)
          setUser(session.user)
          setLoading(false)
        } else if (event === 'INITIAL_SESSION') {
          // Handle initial session properly
          if (session?.user) {
            console.log('🏠 Initial session with user:', session.user.email)
            setUser(session.user)
          } else {
            console.log('🏠 Initial session without user')
            setUser(null)
          }
          setLoading(false)
        } else {
          console.log('👤 No user session for event:', event)
          setLoading(false)
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
      console.log('🚀 Starting Google OAuth...', window.location.origin)
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`
          }
        })
        if (error) {
          console.error('❌ OAuth error:', error)
        } else {
          console.log('✅ OAuth initiated successfully')
        }
        return { data, error }
      } catch (err) {
        console.error('💥 OAuth exception:', err)
        return { data: null, error: err }
      }
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