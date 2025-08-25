import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import SearchResults from './SearchResults'
import aiService from '../services/aiService'
import scrapingService from '../services/scrapingService'
import { 
  Search, 
  CreditCard, 
  TrendingUp, 
  Plus, 
  User, 
  LogOut,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Gift
} from 'lucide-react'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [currentSearchQuery, setCurrentSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAddCardModal, setShowAddCardModal] = useState(false)
  const searchContainerRef = useRef(null)

  // Mock data for demonstration
  const [userStats, setUserStats] = useState({
    lifetimeSavings: 45680,
    cardsCount: 3,
    monthlyAvg: 3840
  })

  const [recentSearches] = useState([
    'iPhone 15 Pro Max',
    'Samsung Galaxy Buds',
    'Nike Air Jordan',
    'MacBook Pro M3'
  ])

  // Click outside to close search results and suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false)
        setShowSuggestions(false)
        setCurrentSearchQuery('')
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowResults(false)
        setShowSuggestions(false)
        setCurrentSearchQuery('')
      }
    }

    if (showResults || showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showResults, showSuggestions])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      setCurrentSearchQuery(searchQuery.trim())
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleBackToDashboard = () => {
    setShowResults(false)
    setCurrentSearchQuery('')
    setSearchQuery('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleSearchInput = async (value) => {
    setSearchQuery(value)
    
    if (value.length > 1) {
      try {
        const productSuggestions = await scrapingService.getProductSuggestions(value)
        setSuggestions(productSuggestions)
        setShowSuggestions(productSuggestions.length > 0)
      } catch (error) {
        console.error('Failed to get suggestions:', error)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion)
    setSuggestions([])
    setShowSuggestions(false)
    // Auto-trigger search
    handleSearchWithQuery(suggestion)
  }

  const handleSearchWithQuery = async (queryToSearch = null) => {
    const query = queryToSearch || searchQuery
    if (!query.trim()) return

    setIsSearching(true)
    setSuggestions([])
    setShowSuggestions(false)
    
    try {
      setCurrentSearchQuery(query.trim())
      setShowResults(true)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) console.error('Error signing out:', error)
  }

  const handleAddCard = () => {
    setShowAddCardModal(true)
  }

  const handleCloseAddCardModal = () => {
    setShowAddCardModal(false)
  }

  const handleApplyNow = (cardName, bankUrl = '') => {
    // Create a temporary link and click it to open in new tab
    const link = document.createElement('a')
    if (bankUrl) {
      link.href = bankUrl
    } else {
      // Fallback URLs for popular cards
      const cardUrls = {
        'ICICI Amazon Pay Credit Card': 'https://www.icicibank.com/personal-banking/cards/credit-card/amazon-pay-credit-card',
        'HDFC Millennia Credit Card': 'https://www.hdfcbank.com/personal/pay/cards/credit-cards/millennia-credit-card',
        'SBI SimplyCLICK Credit Card': 'https://www.sbi.co.in/web/personal-banking/cards/credit-cards/rewards-credit-cards/simplyclick-advantage-reward-credit-card',
        'Axis Bank Ace Credit Card': 'https://www.axisbank.com/retail/cards/credit-card/ace-credit-card',
        'HDFC Bank Regalia First Credit Card': 'https://www.hdfcbank.com/personal/pay/cards/credit-cards/regalia-first-credit-card',
        'Axis Bank My Zone Credit Card': 'https://www.axisbank.com/retail/cards/credit-card/my-zone-credit-card'
      }
      
      link.href = cardUrls[cardName] || 'https://www.google.com/search?q=' + encodeURIComponent(cardName + ' apply online')
    }
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Show success message
    alert(`Opening ${cardName} application page. You'll be redirected to the bank's official website.`)
  }

  // Removed separate page for search results - now showing inline

  return (
    <div className="min-h-screen bg-primary-bg">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-primary-surface/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-accent to-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-poppins font-bold text-text-primary">CardSaver</h1>
            </div>

            {/* User Menu - Mobile Optimized */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User Info - Hidden on small mobile, shown on larger screens */}
              <div className="text-right hidden sm:block">
                <p className="text-sm text-text-primary font-medium">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-text-secondary truncate max-w-24 sm:max-w-none">{user?.email}</p>
              </div>
              <img 
                src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}&background=6366f1&color=fff`}
                alt="Profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-primary-accent/30"
              />
              <button
                onClick={handleSignOut}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-primary-surface rounded-lg transition-colors touch-manipulation"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="premium-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Lifetime Savings</p>
                <p className="text-xl sm:text-2xl font-bold text-primary-gold">₹{userStats.lifetimeSavings.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-gold/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary-gold" />
              </div>
            </div>
          </div>

          <div className="premium-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Active Cards</p>
                <p className="text-xl sm:text-2xl font-bold text-text-primary">{userStats.cardsCount}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-accent/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary-accent" />
              </div>
            </div>
          </div>

          <div className="premium-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Monthly Average</p>
                <p className="text-xl sm:text-2xl font-bold text-primary-success">₹{userStats.monthlyAvg.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-success/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Search Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-poppins font-bold text-text-primary mb-3 sm:mb-4 px-2">
            Discover Your Maximum Savings
          </h2>
          <p className="text-base sm:text-lg text-text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Search for any product and let our AI find the best deals with optimal credit card recommendations
          </p>

          {/* Search Form */}
          <div ref={searchContainerRef} className="max-w-2xl mx-auto relative px-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSearchWithQuery(); }} className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true)
                }}
                onBlur={() => {
                  // Delay hiding suggestions to allow clicks
                  setTimeout(() => setShowSuggestions(false), 150)
                }}
                placeholder="Search products... (e.g., iPhone 15 Pro Max)"
                className="search-input w-full text-base sm:text-lg pr-16 sm:pr-20 shadow-lg"
                disabled={isSearching}
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-primary-gold hover:bg-yellow-400 text-gray-900 font-medium rounded-lg h-10 sm:h-12 px-3 sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-md"
              >
                {isSearching ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
            
            {/* Google-like Search Suggestions - Mobile Optimized */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-4 right-4 mt-1 bg-primary-surface border border-slate-600/50 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 sm:px-4 py-3 sm:py-3 hover:bg-primary-bg cursor-pointer flex items-center border-b border-slate-600/30 last:border-b-0 transition-colors touch-manipulation"
                  >
                    <Search className="w-4 h-4 text-text-secondary mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-text-primary text-sm sm:text-base truncate">{suggestion}</span>
                    <span className="ml-auto text-xs text-text-secondary hidden sm:inline">Press Enter</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Inline Search Results Dropdown */}
            {showResults && currentSearchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 z-40">
                <SearchResults 
                  searchQuery={currentSearchQuery}
                  onBack={handleBackToDashboard}
                  isInline={true}
                />
              </div>
            )}
          </form>
          </div>

          {/* Quick Search Tags - Mobile Optimized */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 px-4">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(search)}
                className="px-3 sm:px-4 py-2 bg-primary-surface border border-slate-600/50 rounded-full text-text-secondary hover:text-text-primary hover:border-primary-accent/50 transition-all duration-300 text-xs sm:text-sm touch-manipulation"
              >
                {search}
              </button>
            ))}
          </div>
        </div>

        {/* Action Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Card Portfolio */}
          <div className="premium-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h3 className="text-lg sm:text-xl font-semibold text-text-primary">Your Card Portfolio</h3>
              <button 
                onClick={handleAddCard}
                className="premium-button text-sm px-4 py-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </button>
            </div>

            <div className="space-y-4">
              {/* Mock Cards */}
              <div className="flex items-center justify-between p-4 bg-primary-bg rounded-lg border border-slate-600/30">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">SBI SimplyCLICK</p>
                    <p className="text-text-secondary text-sm">**** 4567</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary-success font-medium">5% Cashback</p>
                  <p className="text-text-secondary text-xs">Online Shopping</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary-bg rounded-lg border border-slate-600/30">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">HDFC Millennia</p>
                    <p className="text-text-secondary text-sm">**** 8901</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary-success font-medium">2.5% Rewards</p>
                  <p className="text-text-secondary text-xs">All Categories</p>
                </div>
              </div>

              <button className="w-full p-4 border-2 border-dashed border-slate-600/50 rounded-lg text-text-secondary hover:border-primary-accent/50 hover:text-text-primary transition-all duration-300">
                <Plus className="w-5 h-5 mx-auto mb-2" />
                <p className="text-sm">Add Another Card</p>
              </button>
            </div>
          </div>

          {/* Recommendations */}
          <div className="premium-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">Smart Recommendations</h3>
              <Gift className="w-6 h-6 text-primary-gold" />
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-primary-gold/10 to-yellow-400/10 rounded-lg border border-primary-gold/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-text-primary font-medium mb-2">Missing ₹12,000 Annual Savings</p>
                    <p className="text-text-secondary text-sm mb-3">
                      Get the ICICI Amazon Pay card for 5% cashback on Amazon purchases
                    </p>
                    <button 
                      onClick={() => handleApplyNow('ICICI Amazon Pay Credit Card')}
                      className="gold-button text-sm px-4 py-2"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-primary-accent/10 to-indigo-400/10 rounded-lg border border-primary-accent/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-text-primary font-medium mb-2">Upgrade Opportunity</p>
                    <p className="text-text-secondary text-sm mb-3">
                      Switch to Axis Magnus for premium travel benefits and higher rewards
                    </p>
                    <button 
                      onClick={() => handleApplyNow('Axis Bank Magnus Credit Card')}
                      className="premium-button text-sm px-4 py-2"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-surface rounded-lg shadow-xl max-w-md w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-text-primary">Add New Card</h3>
                <button
                  onClick={handleCloseAddCardModal}
                  className="p-2 text-text-secondary hover:text-text-primary hover:bg-primary-bg rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Card Name</label>
                  <input
                    type="text"
                    placeholder="e.g., HDFC Millennia Credit Card"
                    className="search-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Bank/Issuer</label>
                  <input
                    type="text"
                    placeholder="e.g., HDFC Bank"
                    className="search-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Card Number (Last 4 digits)</label>
                  <input
                    type="text"
                    placeholder="e.g., 1234"
                    maxLength="4"
                    className="search-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Cashback/Rewards Rate</label>
                  <input
                    type="text"
                    placeholder="e.g., 5% on online shopping"
                    className="search-input w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleCloseAddCardModal}
                  className="flex-1 px-4 py-3 border border-slate-600 text-text-secondary hover:text-text-primary hover:border-slate-500 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Card added successfully! This feature will save your card details for better recommendations.')
                    handleCloseAddCardModal()
                  }}
                  className="flex-1 gold-button py-3"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}