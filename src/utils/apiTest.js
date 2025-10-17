import api from '../services/api'

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...')
    
    // Test health check
    const healthResponse = await api.get('/health')
    console.log('Health check:', healthResponse.data)
    
    // Test products endpoint
    const productsResponse = await api.get('/products?page=1&per_page=5')
    console.log('Products test:', productsResponse.data)
    
    // Test featured products
    const featuredResponse = await api.get('/products/featured')
    console.log('Featured products test:', featuredResponse.data)
    
    console.log('✅ API connection successful!')
    return { success: true, message: 'API connection successful' }
    
  } catch (error) {
    console.error('❌ API connection failed:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'API connection failed' 
    }
  }
}

export const testAuthEndpoints = async () => {
  try {
    console.log('Testing auth endpoints...')
    
    // Test if auth endpoints are accessible (should return 401 without token)
    const authResponse = await api.get('/auth/user')
    console.log('Auth test:', authResponse.data)
    
    return { success: true, message: 'Auth endpoints accessible' }
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Auth endpoints working (401 expected without token)')
      return { success: true, message: 'Auth endpoints working correctly' }
    }
    
    console.error('❌ Auth endpoints test failed:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Auth endpoints test failed' 
    }
  }
}

export const testCartEndpoints = async () => {
  try {
    console.log('Testing cart endpoints...')
    
    // Test if cart endpoints are accessible (should return 401 without token)
    const cartResponse = await api.get('/cart')
    console.log('Cart test:', cartResponse.data)
    
    return { success: true, message: 'Cart endpoints accessible' }
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Cart endpoints working (401 expected without token)')
      return { success: true, message: 'Cart endpoints working correctly' }
    }
    
    console.error('❌ Cart endpoints test failed:', error)
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || 'Cart endpoints test failed' 
    }
  }
}

export const runAllTests = async () => {
  console.log('🚀 Running all API tests...')
  
  const results = {
    health: await testApiConnection(),
    auth: await testAuthEndpoints(),
    cart: await testCartEndpoints()
  }
  
  const allPassed = Object.values(results).every(result => result.success)
  
  console.log('📊 Test Results:', results)
  console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed!')
  
  return { allPassed, results }
}
