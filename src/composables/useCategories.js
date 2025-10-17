import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export function useCategories() {
  const router = useRouter()

  // State
  const categories = ref([])
  const categoriesLoading = ref(false)
  const categoriesError = ref(null)

  // Product mapping with their specific IDs and names
  const productConfig = [
    {
      name: 'Samba OG Shoes',
      productId: 11,
      table: 'products_men',
      categoryLabel: 'Sports',
      description: 'Performance & Training',
      icon: 'sports_soccer',
      gradient: 'from-primary-orange/20 to-accent-green/20',
      hoverGradient: 'from-primary-orange/30 to-accent-green/30'
    },
    {
      name: 'Campus 00s Shoes',
      productId: 12,
      table: 'products_men',
      categoryLabel: 'Lifestyle',
      description: 'Casual & Comfort',
      icon: 'directions_walk',
      gradient: 'from-purple-500/20 to-pink-500/20',
      hoverGradient: 'from-purple-500/30 to-pink-500/30'
    },
    {
      name: 'Running',
      searchQuery: 'running',
      categoryLabel: 'Running',
      description: 'Speed & Endurance',
      icon: 'running',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      hoverGradient: 'from-blue-500/30 to-cyan-500/30'
    },
    {
      name: 'Training',
      searchQuery: 'training',
      categoryLabel: 'Training',
      description: 'Strength & Power',
      icon: 'fitness_center',
      gradient: 'from-green-500/20 to-emerald-500/20',
      hoverGradient: 'from-green-500/30 to-emerald-500/30'
    }
  ]

  // Load products by their specific IDs or search queries
  const loadCategories = async () => {
    categoriesLoading.value = true
    categoriesError.value = null

    try {
      const loadedCategories = []

      for (const config of productConfig) {
        try {
          let product = null
          let imageUrl = ''

          // If we have a specific product ID, fetch it directly
          if (config.productId) {
            console.log(`🔍 Fetching product by ID: ${config.productId} from table: ${config.table}`)

            const response = await fetch(`/api/products/${config.productId}?table=${config.table}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            })

            if (response.ok) {
              const data = await response.json()
              if (data.success && data.data) {
                product = data.data
                imageUrl = product.image_url || product.image || ''
                console.log(`✅ Loaded product by ID: ${product.name}`)
              }
            }
          }
          // Otherwise, search by category
          else if (config.searchQuery) {
            console.log(`🔍 Searching for category: ${config.searchQuery}`)

            const response = await fetch(`/api/search/products?category=${config.searchQuery}&limit=1`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            })

            if (response.ok) {
              const data = await response.json()
              if (data.success && data.data.products && data.data.products.length > 0) {
                product = data.data.products[0]
                imageUrl = product.image_url || product.image || ''
                console.log(`✅ Loaded product by category: ${product.name}`)
              }
            }
          }

          // Add product to categories
          if (product) {
            loadedCategories.push({
              name: product.name || config.name,
              description: config.description,
              icon: config.icon,
              gradient: config.gradient,
              hoverGradient: config.hoverGradient,
              image: imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
              productId: product.id,
              productTable: config.table || product.table || 'products_men',
              category: config.categoryLabel,
              price: product.price,
              brand: product.brand
            })
          } else {
            // Add fallback card
            loadedCategories.push({
              name: config.name,
              description: config.description,
              icon: config.icon,
              gradient: config.gradient,
              hoverGradient: config.hoverGradient,
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
              productId: null,
              productTable: null,
              category: config.categoryLabel
            })
            // Product not found - using fallback image (silent)
          }
        } catch (err) {
          console.error(`Error loading product ${config.name}:`, err)
          // Add fallback card
          loadedCategories.push({
            name: config.name,
            description: config.description,
            icon: config.icon,
            gradient: config.gradient,
            hoverGradient: config.hoverGradient,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
            productId: null,
            productTable: null,
            category: config.categoryLabel
          })
        }
      }

      categories.value = loadedCategories
      console.log('📦 Products loaded:', categories.value.length)

    } catch (err) {
      console.error('Error loading products:', err)
      categoriesError.value = err.message
    } finally {
      categoriesLoading.value = false
    }
  }

  // Navigate to product detail or products page
  const goToCategory = (category) => {
    if (category.productId) {
      // Navigate to product detail page if product ID exists
      router.push({
        name: 'ProductDetail',
        params: {
          id: category.productId,
          table: category.productTable
        }
      })
      } else {
      // Fallback to products page filtered by category
      router.push({
        name: 'Products',
        query: { category: category.category }
      })
    }
  }

  // Auto-load on mount
  onMounted(() => {
    loadCategories()
  })

  return {
    // State
    categories,
    loading: categoriesLoading,
    error: categoriesError,

    // Actions
    loadCategories,
    goToCategory
  }
}
