import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import aiService from '../services/aiService'
import { 
  Search, 
  CreditCard, 
  TrendingUp, 
  ArrowLeft, 
  ExternalLink, 
  Star,
  Sparkles,
  ShoppingBag,
  Award,
  Calculator
} from 'lucide-react'

export default function SearchResults({ searchQuery, onBack, isInline = false }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

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
        'Axis Bank My Zone Credit Card': 'https://www.axisbank.com/retail/cards/credit-card/my-zone-credit-card',
        'Axis Bank Flipkart Credit Card': 'https://www.axisbank.com/retail/cards/credit-card/flipkart-credit-card'
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

  useEffect(() => {
    if (searchQuery) {
      performSearch()
    }
  }, [searchQuery])

  const performSearch = async () => {
    try {
      setLoading(true)
      setError(null)
      const searchResults = await aiService.searchProducts(searchQuery)
      setResults(searchResults)
    } catch (err) {
      setError(err.message)
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    performSearch()
  }

  if (loading) {
    const content = (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-accent/20 rounded-full mb-3">
          <Sparkles className="w-6 h-6 text-primary-accent animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          CardSaver is finding the best deals for you...
        </h3>
        <p className="text-text-secondary text-sm mb-4">
          Analyzing prices across multiple retailers and optimizing credit card rewards
        </p>
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary-accent rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-primary-gold rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-primary-success rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
        </div>
      </div>
    )

    if (isInline) {
      return (
        <div className="premium-card max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-600/30">
            <h2 className="text-lg font-semibold text-text-primary">
              Searching for "{searchQuery}"
            </h2>
            <button
              onClick={onBack}
              className="p-1 text-text-secondary hover:text-text-primary hover:bg-primary-surface rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
          {content}
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-primary-surface rounded-lg transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">
              Searching for "{searchQuery}"
            </h1>
          </div>
          <div className="premium-card">
            {content}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    const errorContent = (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-3">
          <Search className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Search Failed
        </h3>
        <p className="text-text-secondary text-sm mb-4">
          {error}
        </p>
        <div className="space-x-3">
          <button
            onClick={handleRetry}
            className="gold-button px-4 py-2 text-sm"
          >
            Try Again
          </button>
          <button
            onClick={onBack}
            className="premium-button px-4 py-2 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    )

    if (isInline) {
      return (
        <div className="premium-card max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-600/30">
            <h2 className="text-lg font-semibold text-text-primary">
              Search Error
            </h2>
            <button
              onClick={onBack}
              className="p-1 text-text-secondary hover:text-text-primary hover:bg-primary-surface rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
          {errorContent}
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={onBack}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-primary-surface rounded-lg transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">Search Error</h1>
          </div>
          <div className="premium-card">
            {errorContent}
          </div>
        </div>
      </div>
    )
  }

  const mainContent = (
    <>
      {/* Top Card Recommendation - Use YOUR card for maximum savings */}
      {results?.creditCardRecommendations && results.creditCardRecommendations.length > 0 && (
        <div className="premium-card mb-6 bg-gradient-to-r from-primary-gold/10 to-yellow-400/10 border-primary-gold/30">
          <div className="flex items-center mb-4">
            <CreditCard className="w-5 h-5 text-primary-gold mr-2" />
            <h3 className="text-lg font-bold text-text-primary">💡 Use Your Optimal Card</h3>
          </div>
          <div className="bg-primary-bg rounded-lg p-4 border border-slate-600/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-text-secondary text-sm">Recommended Card</p>
                <p className="text-lg font-bold text-primary-gold">{results.creditCardRecommendations[0]?.bestCard}</p>
                <p className="text-text-secondary text-xs">{results.creditCardRecommendations[0]?.cashbackRate}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">You'll Save</p>
                <p className="text-xl font-bold text-primary-success">{results.creditCardRecommendations[0]?.expectedSavings}</p>
                <p className="text-text-secondary text-xs">with this purchase</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Category Match</p>
                <p className="text-text-primary text-sm">{results.creditCardRecommendations[0]?.category}</p>
                <button 
                  onClick={() => handleApplyNow(results.creditCardRecommendations[0]?.bestCard)}
                  className="mt-2 text-xs px-3 py-1 bg-primary-gold/20 text-primary-gold rounded-full hover:bg-primary-gold/30 transition-colors"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid - Google-like Search Results */}
      <div className="space-y-4">
        {results?.products?.map((product, index) => {
          return (
            <div key={index} className="premium-card hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Product Image - Mobile Optimized */}
                <div className="product-image-container sm:w-32 sm:h-32 sm:max-w-none sm:mx-0">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="product-image rounded-lg"
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
                        e.target.src = `https://via.placeholder.com/300x300/1e293b/cbd5e1?text=${encodeURIComponent(product.name.split(' ')[0])}`
                      }}
                      onLoad={(e) => {
                        console.log('Image loaded successfully:', e.target.src);
                        e.target.classList.remove('image-loading');
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-surface rounded-lg flex items-center justify-center border border-slate-600/20">
                      <ShoppingBag className="w-12 h-12 sm:w-8 sm:h-8 text-text-secondary" />
                    </div>
                  )}
                </div>
                
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-text-primary mb-2 leading-tight hover:text-primary-accent cursor-pointer">
                    {product.name}
                  </h4>
                  
                  {/* Retailer with Logo */}
                  <div className="flex items-center mb-2 flex-wrap gap-1">
                    {product.retailerLogo && (
                      <img 
                        src={product.retailerLogo} 
                        alt={product.retailer}
                        className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 object-contain flex-shrink-0"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    )}
                    <p className="text-text-secondary text-xs sm:text-sm">at {product.retailer}</p>
                    {product.availability && (
                      <span className={`ml-1 sm:ml-2 px-2 py-1 rounded text-xs ${
                        product.availability === 'In Stock' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}>
                        {product.availability}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-lg sm:text-xl font-bold text-primary-success">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-text-secondary line-through">{product.originalPrice}</span>
                    )}
                    {product.discount && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
                        {product.discount}
                      </span>
                    )}
                  </div>
                  
                  {/* Rating and Reviews - Mobile Optimized */}
                  {product.rating && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1 flex-shrink-0" />
                        <span className="text-sm font-medium text-text-primary">{product.rating}</span>
                        {product.reviews && (
                          <span className="text-xs text-text-secondary ml-1">({product.reviews.toLocaleString()})</span>
                        )}
                      </div>
                      {product.delivery && (
                        <span className="text-xs text-green-400">{product.delivery}</span>
                      )}
                    </div>
                  )}
                  
                  {product.url && (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-accent hover:text-primary-accent/80 transition-colors text-sm touch-manipulation"
                    >
                      <ExternalLink className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">View on {product.retailer}</span>
                    </a>
                  )}
                </div>
                
                {/* Retailer Color Badge - Mobile Optimized */}
                <div className="flex sm:flex-col items-center sm:items-center justify-center sm:justify-start">
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-0 sm:mb-2"
                    style={{ backgroundColor: `${product.retailerColor}20`, border: `1px solid ${product.retailerColor}30` }}
                  >
                    <ShoppingBag 
                      className="w-5 h-5 sm:w-6 sm:h-6" 
                      style={{ color: product.retailerColor }}
                    />
                  </div>
                  {results?.realDataFetched && (
                    <span className="text-xs text-green-400 flex items-center ml-2 sm:ml-0">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                      <span className="hidden sm:inline">Live Data</span>
                      <span className="sm:hidden">Live</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Product Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-4">
                  <p className="text-text-secondary text-sm mb-2">Key Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((feature, fIndex) => (
                      <span
                        key={fIndex}
                        className="px-2 py-1 bg-primary-surface border border-slate-600/50 rounded text-xs text-text-secondary"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons for Product */}
              <div className="mt-4 pt-4 border-t border-slate-600/30">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {product.url && (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 premium-button py-3 flex items-center justify-center text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Buy on {product.retailer}
                    </a>
                  )}
                  <button className="flex-1 gold-button py-3 flex items-center justify-center text-sm">
                    <Star className="w-4 h-4 mr-2" />
                    Compare Prices
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Card Recommendation Summary */}
      {results?.products && results.products.length > 0 && results?.creditCardRecommendations && results.creditCardRecommendations.length > 0 && (
        <div className="mt-8 premium-card bg-gradient-to-r from-primary-accent/10 to-blue-400/10 border-primary-accent/30">
          <div className="flex items-center mb-4">
            <Award className="w-5 h-5 text-primary-accent mr-2" />
            <h3 className="text-lg font-bold text-text-primary">💰 Maximum Savings Summary</h3>
          </div>
          <div className="bg-primary-bg rounded-lg p-4 border border-slate-600/30">
            <p className="text-text-primary mb-3">
              <span className="font-semibold">Sir, if you had the {results.creditCardRecommendations[0]?.bestCard}</span>, 
              you would save <span className="text-primary-success font-bold text-lg">{results.creditCardRecommendations[0]?.expectedSavings}</span> on this purchase!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-text-secondary text-sm">Card Benefits</p>
                <p className="text-text-primary">{results.creditCardRecommendations[0]?.cashbackRate} on {results.creditCardRecommendations[0]?.category}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Total Potential Savings</p>
                <p className="text-primary-gold font-bold text-xl">{results.creditCardRecommendations[0]?.expectedSavings}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => handleApplyNow(results.creditCardRecommendations[0]?.bestCard)}
                className="flex-1 gold-button py-3 flex items-center justify-center"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Apply for {results.creditCardRecommendations[0]?.bestCard}
              </button>
              <button className="flex-1 premium-button py-3 flex items-center justify-center">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Annual Savings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!results?.products || results.products.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-surface rounded-full mb-3">
            <Search className="w-6 h-6 text-text-secondary" />
          </div>
          <h4 className="text-lg font-semibold text-text-primary mb-2">
            No products found
          </h4>
          <p className="text-text-secondary text-sm mb-4">
            Try searching with different keywords or check your spelling.
          </p>
          <button
            onClick={onBack}
            className="premium-button px-4 py-2 text-sm"
          >
            Close
          </button>
        </div>
      ) : null}
    </>
  )

  if (isInline) {
    return (
      <div className="premium-card max-h-80 sm:max-h-96 overflow-y-auto mx-4 sm:mx-0">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-600/30">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-text-primary flex flex-col sm:flex-row sm:items-center">
              <span className="truncate">Search Results for "{searchQuery}"</span>
              {results?.realDataFetched && (
                <span className="mt-1 sm:mt-0 sm:ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30 flex items-center self-start sm:self-auto">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  Live Data
                </span>
              )}
            </h2>
            <p className="text-text-secondary text-xs sm:text-sm mt-1">
              Found {results?.products?.length || 0} products from {results?.realDataFetched ? 'real retailers' : 'AI analysis'}
            </p>
            {results?.timestamp && (
              <p className="text-xs text-text-secondary mt-1 hidden sm:block">
                Last updated: {new Date(results.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={handleRetry}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-primary-surface rounded transition-colors touch-manipulation"
              title="Refresh Search"
              aria-label="Refresh Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onBack}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-primary-surface rounded transition-colors touch-manipulation"
              title="Close"
              aria-label="Close"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
        {mainContent}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-primary-surface rounded-lg transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Search Results for "{searchQuery}"
              </h1>
              <p className="text-text-secondary">
                Found {results?.products?.length || 0} products with optimized credit card recommendations
              </p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="premium-button px-4 py-2 text-sm"
          >
            <Search className="w-4 h-4 mr-2" />
            Refresh Search
          </button>
        </div>

        {mainContent}
      </div>
    </div>
  )
}