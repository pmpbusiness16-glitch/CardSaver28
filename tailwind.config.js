/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#0F172A',
          surface: '#1E293B',
          accent: '#6366F1',
          gold: '#FCD34D',
          success: '#10B981',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#CBD5E1',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-surface': 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
      },
      borderRadius: {
        'card': '12px',
        'modal': '24px',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(99, 102, 241, 0.2)',
        'glow-gold': '0 0 15px rgba(252, 211, 77, 0.3)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}