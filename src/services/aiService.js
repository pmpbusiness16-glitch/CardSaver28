import scrapingService from './scrapingService.js'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export class AIService {
  constructor() {
    if (!DEEPSEEK_API_KEY && !GEMINI_API_KEY) {
      throw new Error('No AI API keys found in environment variables')
    }
  }

  async searchProducts(query) {
    try {
      // Step 1: Get real product data from scraping service
      console.log('🔍 Fetching real product data...')
      const realProducts = await scrapingService.searchProducts(query)
      
      // Step 2: Use AI to analyze and optimize the real data
      console.log('🤖 AI analyzing products for credit card optimization...')
      const aiAnalysis = await this.analyzeProductsWithAI(query, realProducts)
      
      return {
        products: realProducts,
        creditCardRecommendations: aiAnalysis.creditCardRecommendations,
        bestDeal: aiAnalysis.bestDeal,
        realDataFetched: true,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Real data search failed:', error)
      
      // Fallback to AI-only search
      return await this.fallbackSearch(query)
    }
  }

  async analyzeProductsWithAI(query, products) {
    const productData = products.map((p, index) => ({
      index,
      name: p.name,
      price: p.price,
      retailer: p.retailer,
      rating: p.rating,
      features: p.features
    }))

    const prompt = `Analyze these REAL products and recommend the best credit cards for maximum savings:

SEARCH QUERY: "${query}"

REAL PRODUCTS FOUND:
${productData.map(p => `${p.index + 1}. ${p.name} at ${p.retailer} - ${p.price} (Rating: ${p.rating})`).join('\n')}

Please analyze and provide:
1. Best credit card recommendation for EACH retailer
2. Calculate exact savings for each product
3. Identify the overall best deal

Respond in JSON format:
{
  "creditCardRecommendations": [
    {
      "productIndex": 0,
      "retailer": "exact retailer name from above",
      "bestCard": "specific Indian credit card name",
      "cashbackRate": "X%",
      "expectedSavings": "₹X",
      "category": "category that applies",
      "whyBest": "brief reason"
    }
  ],
  "bestDeal": {
    "productIndex": 0,
    "totalSavings": "₹X",
    "finalPrice": "₹X",
    "reason": "why this is best overall deal"
  }
}

Focus on real Indian credit cards like SBI SimplyCLICK, HDFC Millennia, Axis Bank Ace, ICICI Amazon Pay, etc.`

    try {
      let aiResponse
      if (DEEPSEEK_API_KEY) {
        try {
          aiResponse = await this.callDeepSeekForAnalysis(prompt)
        } catch (error) {
          console.warn('DeepSeek analysis failed, trying Gemini:', error.message)
          aiResponse = await this.callGeminiForAnalysis(prompt)
        }
      } else if (GEMINI_API_KEY) {
        aiResponse = await this.callGeminiForAnalysis(prompt)
      }

      return this.parseAIAnalysis(aiResponse, products)
    } catch (error) {
      console.error('AI analysis failed:', error)
      return this.getFallbackAnalysis(products)
    }
  }

  async fallbackSearch(query) {
    // Try DeepSeek first, then fallback to Gemini
    if (DEEPSEEK_API_KEY) {
      try {
        return await this.searchWithDeepSeek(query)
      } catch (error) {
        console.warn('DeepSeek failed, trying Gemini:', error.message)
      }
    }

    if (GEMINI_API_KEY) {
      try {
        return await this.searchWithGemini(query)
      } catch (error) {
        console.error('Both APIs failed. Gemini error:', error.message)
      }
    }

    throw new Error('All AI services are unavailable')
  }

  async searchWithDeepSeek(query) {
    const prompt = `As a smart shopping assistant for credit card rewards optimization, help find the best deals for "${query}".

Please provide:
1. Top 3-5 product recommendations with prices from different retailers
2. Best credit cards to use for maximum savings/rewards for each retailer
3. Calculate potential cashback/rewards for each option
4. Overall best deal recommendation

Format the response as JSON with this structure:
{
  "products": [
    {
      "name": "Product name",
      "price": "Price in ₹",
      "retailer": "Retailer name",
      "url": "Product URL if available",
      "features": ["key feature 1", "key feature 2"]
    }
  ],
  "creditCardRecommendations": [
    {
      "productIndex": 0,
      "retailer": "Retailer name",
      "bestCard": "Credit card name",
      "cashbackRate": "5%",
      "expectedSavings": "₹500",
      "category": "Online Shopping"
    }
  ],
  "bestDeal": {
    "productIndex": 0,
    "totalSavings": "₹500",
    "finalPrice": "₹9500",
    "reason": "Why this is the best deal"
  }
}

Focus on Indian retailers like Amazon India, Flipkart, etc. and popular Indian credit cards.`

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid DeepSeek API response structure')
    }

    const aiResponse = data.choices[0].message.content
    
    // Try to parse JSON from the response
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        return this.parseTextResponse(aiResponse, query)
      }
    } catch (parseError) {
      console.warn('Failed to parse DeepSeek JSON, creating structured response from text')
      return this.parseTextResponse(aiResponse, query)
    }
  }

  async searchWithGemini(query) {
    const prompt = `As a smart shopping assistant for credit card rewards optimization, help find the best deals for "${query}".

Please provide:
1. Top 3-5 product recommendations with prices from different retailers  
2. Best credit cards to use for maximum savings/rewards for each retailer
3. Calculate potential cashback/rewards for each option
4. Overall best deal recommendation

Format the response as JSON with this structure:
{
  "products": [
    {
      "name": "Product name",
      "price": "Price in ₹", 
      "retailer": "Retailer name",
      "url": "Product URL if available",
      "features": ["key feature 1", "key feature 2"]
    }
  ],
  "creditCardRecommendations": [
    {
      "productIndex": 0,
      "retailer": "Retailer name", 
      "bestCard": "Credit card name",
      "cashbackRate": "5%",
      "expectedSavings": "₹500",
      "category": "Online Shopping"
    }
  ],
  "bestDeal": {
    "productIndex": 0,
    "totalSavings": "₹500", 
    "finalPrice": "₹9500",
    "reason": "Why this is the best deal"
  }
}

Focus on Indian retailers like Amazon India, Flipkart, etc. and popular Indian credit cards.`

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts[0]) {
      throw new Error('Invalid Gemini API response structure')
    }

    const aiResponse = data.candidates[0].content.parts[0].text
    
    // Try to parse JSON from the response
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      } else {
        return this.parseTextResponse(aiResponse, query)
      }
    } catch (parseError) {
      console.warn('Failed to parse Gemini JSON, creating structured response from text')
      return this.parseTextResponse(aiResponse, query)
    }
  }

  parseTextResponse(text, query) {
    // Fallback parser for non-JSON responses
    return {
      products: [
        {
          name: query,
          price: "Price information being fetched...",
          retailer: "Multiple retailers",
          url: null,
          features: ["AI-powered search results", "Real-time pricing"]
        }
      ],
      creditCardRecommendations: [
        {
          productIndex: 0,
          retailer: "General recommendation",
          bestCard: "SBI SimplyCLICK or HDFC Millennia",
          cashbackRate: "2-5%",
          expectedSavings: "Calculating...",
          category: "Online Shopping"
        }
      ],
      bestDeal: {
        productIndex: 0,
        totalSavings: "Calculating...",
        finalPrice: "Best price being found...",
        reason: "AI is analyzing the best deals for you"
      },
      rawResponse: text
    }
  }

  async callDeepSeekForAnalysis(prompt) {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async callGeminiForAnalysis(prompt) {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }

  parseAIAnalysis(aiResponse, products) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return parsed
      } else {
        return this.getFallbackAnalysis(products)
      }
    } catch (error) {
      console.warn('Failed to parse AI analysis, using fallback')
      return this.getFallbackAnalysis(products)
    }
  }

  getFallbackAnalysis(products) {
    const creditCardRecommendations = products.map((product, index) => {
      let bestCard = 'SBI SimplyCLICK Credit Card'
      let cashbackRate = '5%'
      let category = 'Online Shopping'
      
      // Smart card recommendations based on retailer
      if (product.retailer.includes('Amazon')) {
        bestCard = 'ICICI Amazon Pay Credit Card'
        cashbackRate = '5%'
        category = 'Amazon Shopping'
      } else if (product.retailer.includes('Flipkart')) {
        bestCard = 'Axis Bank Flipkart Credit Card'
        cashbackRate = '4%'
        category = 'Flipkart Shopping'
      } else if (product.retailer.includes('Croma')) {
        bestCard = 'HDFC Millennia Credit Card'
        cashbackRate = '2.5%'
        category = 'Electronics'
      }
      
      const priceNum = parseInt(product.price.replace(/[₹,]/g, ''))
      const savings = Math.floor(priceNum * parseFloat(cashbackRate) / 100)
      
      return {
        productIndex: index,
        retailer: product.retailer,
        bestCard,
        cashbackRate,
        expectedSavings: `₹${savings.toLocaleString('en-IN')}`,
        category,
        whyBest: `Best cashback rate for ${product.retailer}`
      }
    })

    // Find best deal (lowest final price after cashback)
    let bestDealIndex = 0
    let bestFinalPrice = Infinity
    
    creditCardRecommendations.forEach((rec, index) => {
      const originalPrice = parseInt(products[index].price.replace(/[₹,]/g, ''))
      const savings = parseInt(rec.expectedSavings.replace(/[₹,]/g, ''))
      const finalPrice = originalPrice - savings
      
      if (finalPrice < bestFinalPrice) {
        bestFinalPrice = finalPrice
        bestDealIndex = index
      }
    })

    const bestDeal = {
      productIndex: bestDealIndex,
      totalSavings: creditCardRecommendations[bestDealIndex].expectedSavings,
      finalPrice: `₹${bestFinalPrice.toLocaleString('en-IN')}`,
      reason: `Lowest final price with ${creditCardRecommendations[bestDealIndex].bestCard} at ${products[bestDealIndex].retailer}`
    }

    return { creditCardRecommendations, bestDeal }
  }

  async getCreditCardRecommendation(category, amount) {
    try {
      const prompt = `Recommend the best Indian credit card for a purchase of ₹${amount} in the ${category} category. 
      
      Provide specific card name, cashback/rewards rate, and calculated savings.
      
      Format as JSON:
      {
        "cardName": "Card name",
        "issuer": "Bank name", 
        "cashbackRate": "X%",
        "calculatedSavings": "₹X",
        "category": "${category}",
        "whyBest": "Reason why this card is best"
      }`

      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.5
        })
      })

      const data = await response.json()
      const aiResponse = data.choices[0].message.content
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      throw new Error('Failed to parse card recommendation')
    } catch (error) {
      console.error('Card Recommendation Error:', error)
      return {
        cardName: "SBI SimplyCLICK",
        issuer: "SBI",
        cashbackRate: "5%",
        calculatedSavings: "₹" + (amount * 0.05).toFixed(0),
        category: category,
        whyBest: "Reliable cashback card for online purchases"
      }
    }
  }
}

export default new AIService()