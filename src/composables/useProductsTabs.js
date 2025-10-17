import { ref, computed } from 'vue'
import { buildApiUrl, getAuthHeaders } from '@/config/api'

export function useProductsTabs() {
  // State
  const currentTab = ref('men')
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)
  const isInitialized = ref(false)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
    from: 0,
    to: 0
  })

  // Filters
  const filters = ref({
    search: '',
    brand: '',
    min_price: 0,
    max_price: 1000,
    sort: 'popular'
  })

  // Tab mapping
  const tabMapping = {
    'men': { label: 'Men', table: 'products_men', category: 'Sneakers' },
    'women': { label: 'Women', table: 'products_women', category: 'Training' },
    'kids': { label: 'Kids', table: 'products_kids', category: 'Kids' }
  }

  // Computed
  const currentTabInfo = computed(() => tabMapping[currentTab.value])
  const isLoading = computed(() => loading.value)

  // Methods
  const fetchProducts = async (tab = currentTab.value, page = 1) => {
    // Prevent multiple simultaneous requests
    if (loading.value) {
      console.log('⏳ Request already in progress, skipping...')
      return
    }

    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('auth_token')
      const params = new URLSearchParams({
        tab: tab,
        page: page,
        per_page: 12,
        search: filters.value.search,
        brand: filters.value.brand || '',
        min_price: filters.value.min_price,
        max_price: filters.value.max_price,
        sort: filters.value.sort
      })

      const response = await fetch(`${buildApiUrl('/search/products-by-tab')}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        products.value = data.data.products
        pagination.value = data.data.pagination

        // Update current tab
        currentTab.value = tab

        console.log(`✅ Loaded ${products.value.length} products for ${tabMapping[tab].label} tab`)
      } else {
        throw new Error(data.message || 'Failed to fetch products')
      }
    } catch (err) {
      error.value = err.message
      console.error('❌ Error fetching products:', err)
    } finally {
      loading.value = false
    }
  }

  const switchTab = async (tab) => {
    if (tab === currentTab.value) return

    console.log(`🔄 Switching to ${tabMapping[tab].label} tab...`)
    await fetchProducts(tab, 1)
  }

  const applyFilters = async () => {
    console.log('🔍 Applying filters...')
    await fetchProducts(currentTab.value, 1)
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      brand: '',
      min_price: 0,
      max_price: 1000,
      sort: 'popular'
    }
    fetchProducts(currentTab.value, 1)
  }

  const goToPage = async (page) => {
    if (page >= 1 && page <= pagination.value.last_page) {
      await fetchProducts(currentTab.value, page)
    }
  }

  const viewProduct = (productId) => {
    // Get category from current tab
    const category = currentTab.value // 'men', 'women', or 'kids'

    // Navigate to product details page with category parameter
    if (window.$router) {
      window.$router.push(`/products/${productId}?category=${category}`)
    } else {
      // Fallback to window.location if router is not available
      window.location.href = `/products/${productId}?category=${category}`
    }
  }

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://127.0.0.1:8000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      })

      if (response.ok) {
        console.log('✅ Product added to cart successfully')
        // You can add a toast notification here
      } else {
        console.error('❌ Failed to add product to cart')
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error)
    }
  }

  // Initialize with men's products (only once)
  const initialize = async () => {
    if (!isInitialized.value && !loading.value) {
      isInitialized.value = true
      await fetchProducts('men', 1)
    }
  }

  return {
    // State
    currentTab,
    products,
    loading: isLoading,
    error,
    pagination,
    filters,

    // Computed
    currentTabInfo,
    tabMapping,

    // Methods
    fetchProducts,
    switchTab,
    applyFilters,
    clearFilters,
    goToPage,
    viewProduct,
    addToCart,
    initialize
  }
}
