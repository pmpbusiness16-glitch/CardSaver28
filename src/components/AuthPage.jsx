import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { CreditCard, TrendingUp, Shield, Sparkles } from 'lucide-react'

export default function AuthPage() {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const { error } = await signInWithGoogle()
      if (error) {
        console.error('Error signing in:', error.message)
        alert('Error signing in. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error signing in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4" style={{
      background: 'linear-gradient(135deg, #0F172A 0%, #1e293b 50%, #0F172A 100%)'
    }}>
      <div className="relative max-w-sm sm:max-w-md w-full">
        {/* Main Auth Card - Mobile Optimized */}
        <div className="glass-morphism p-6 sm:p-8 shadow-2xl" style={{ borderRadius: '20px' }}>
          {/* Logo Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl mb-3 sm:mb-4" style={{
              background: 'linear-gradient(to right, #6366F1, #4f46e5)',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)'
            }}>
              <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{
              fontFamily: 'Poppins, sans-serif',
              color: '#F8FAFC'
            }}>
              CardSaver
            </h1>
            <p className="text-sm" style={{ color: '#CBD5E1' }}>
              Your Premium Financial Concierge
            </p>
          </div>

          {/* Features Showcase - Mobile Optimized */}
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 text-sm" style={{ color: '#CBD5E1' }}>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
                backgroundColor: 'rgba(252, 211, 77, 0.2)'
              }}>
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#FCD34D' }} />
              </div>
              <span className="leading-tight">Maximize your cashback on every purchase</span>
            </div>
            <div className="flex items-center space-x-3 text-sm" style={{ color: '#CBD5E1' }}>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)'
              }}>
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#10B981' }} />
              </div>
              <span className="leading-tight">AI-powered card recommendations</span>
            </div>
            <div className="flex items-center space-x-3 text-sm" style={{ color: '#CBD5E1' }}>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
                backgroundColor: 'rgba(99, 102, 241, 0.2)'
              }}>
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#6366F1' }} />
              </div>
              <span className="leading-tight">Discover the best deals across platforms</span>
            </div>
          </div>

          {/* Sign In Button - Mobile Optimized */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full font-semibold py-3 sm:py-4 px-4 sm:px-6 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            style={{
              background: 'white',
              color: '#1f2937',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              minHeight: '48px'
            }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Terms - Mobile Optimized */}
          <p className="text-xs text-center mt-4 sm:mt-6 leading-relaxed" style={{ color: '#CBD5E1' }}>
            By continuing, you agree to our{' '}
            <a href="#" className="hover:underline touch-manipulation" style={{ color: '#6366F1' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="hover:underline touch-manipulation" style={{ color: '#6366F1' }}>Privacy Policy</a>
          </p>
        </div>

        {/* Bottom Stats - Mobile Optimized */}
        <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="glass-morphism p-3 sm:p-4" style={{ borderRadius: '10px' }}>
            <div className="text-base sm:text-lg font-bold" style={{ color: '#FCD34D' }}>₹2.5M+</div>
            <div className="text-xs leading-tight" style={{ color: '#CBD5E1' }}>Savings Generated</div>
          </div>
          <div className="glass-morphism p-3 sm:p-4" style={{ borderRadius: '10px' }}>
            <div className="text-base sm:text-lg font-bold" style={{ color: '#10B981' }}>50K+</div>
            <div className="text-xs leading-tight" style={{ color: '#CBD5E1' }}>Happy Users</div>
          </div>
          <div className="glass-morphism p-3 sm:p-4" style={{ borderRadius: '10px' }}>
            <div className="text-base sm:text-lg font-bold" style={{ color: '#6366F1' }}>15%</div>
            <div className="text-xs leading-tight" style={{ color: '#CBD5E1' }}>Avg. Savings</div>
          </div>
        </div>
      </div>
    </div>
  )
}