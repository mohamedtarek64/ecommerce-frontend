import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export function useKidsProducts() {
  const router = useRouter()

  // State
  const kidsProducts = ref([])
  const kidsLoading = ref(false)
  const kidsError = ref(null)
  const kidsCarouselIndex = ref({})
  const kidsScroller = ref(null)
  let kidsAutoRotateTimer = null
  let kidsInteractionLock = false

  // Helper to convert object/array to array
  const toArray = (val) => {
    if (Array.isArray(val)) return val
    if (val && typeof val === 'object') return Object.values(val)
    return []
  }

  // Normalize product data
  const normalizeProduct = (p) => {
    console.log('🔍 Normalizing product:', p.name, 'with image_url:', p.image_url)

    const allImages = [
      p.image_url || p.image || p.main_image,
      ...toArray(p.additional_images),
      ...toArray(p.images),
      p.image2,
      p.image3,
      p.image4
    ].filter(Boolean)

    console.log('🖼️ All images for', p.name, ':', allImages)

    const normalized = {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price ?? p.original_price ?? 0,
      image: allImages[0] || '',
      images: allImages, // Combined array
      brand: (p.brand || p.brand_name || '').toLowerCase(),
      category: (p.category || p.category_name || '').toLowerCase(),
      gender: (p.gender || p.for_gender || '').toLowerCase(),
      rating: p.rating || 4.6
    }

    console.log('✅ Normalized product:', normalized.name, 'with image:', normalized.image)
    return normalized
  }

  // Get product images
  const getProductImages = (product) => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images
    }
    return [product.image].filter(Boolean)
  }

  // Get current product image
  const currentProductImage = (product) => {
    const images = getProductImages(product)
    const currentIndex = kidsCarouselIndex.value[product.id] || 0
    return images[currentIndex] || images[0] || ''
  }

  // Get current index
  const getCurrentIndex = (product) => {
    return kidsCarouselIndex.value[product.id] || 0
  }

  // Navigate to next image
  const nextImage = (product) => {
    const images = getProductImages(product)
    if (images.length <= 1) return

    const currentIndex = kidsCarouselIndex.value[product.id] || 0
    const nextIndex = (currentIndex + 1) % images.length
    kidsCarouselIndex.value[product.id] = nextIndex
  }

  // Navigate to previous image
  const prevImage = (product) => {
    const images = getProductImages(product)
    if (images.length <= 1) return

    const currentIndex = kidsCarouselIndex.value[product.id] || 0
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    kidsCarouselIndex.value[product.id] = prevIndex
  }

  // Auto-rotate functionality
  const startKidsAutoRotate = () => {
    if (kidsAutoRotateTimer) return
    if (kidsInteractionLock) return

    kidsAutoRotateTimer = setInterval(advanceAllCarousels, 2000)
  }

  const stopKidsAutoRotate = () => {
    if (kidsAutoRotateTimer) {
      clearInterval(kidsAutoRotateTimer)
      kidsAutoRotateTimer = null
    }
  }

  const advanceAllCarousels = () => {
    kidsProducts.value.forEach(product => {
      const images = getProductImages(product)
      if (images.length > 1) {
        nextImage(product)
      }
    })
  }

  // Handle user interaction
  const onKidsUserInteract = () => {
    stopKidsAutoRotate()
    kidsInteractionLock = true
    setTimeout(() => {
      kidsInteractionLock = false
      startKidsAutoRotate()
    }, 3000)
  }

  // Scroll functionality
  const scrollKids = (direction) => {
    if (!kidsScroller.value) return

    const scrollAmount = 300
    const currentScroll = kidsScroller.value.scrollLeft

    if (direction === 'left') {
      kidsScroller.value.scrollLeft = Math.max(0, currentScroll - scrollAmount)
    } else {
      kidsScroller.value.scrollLeft = currentScroll + scrollAmount
    }
  }

  // Load kids products
  const loadKidsProducts = async (featuredImages, categoryImages, instagramImages) => {
    kidsLoading.value = true
    kidsError.value = null

    try {
      console.log('🔍 Loading kids products...')
      const response = await fetch('/api/search/products-by-tab?tab=kids&limit=16', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📦 Kids products API response:', data)
      console.log('📦 Kids products data.data:', data.data)
      console.log('📦 Kids products data.data.products:', data.data?.products)
      console.log('📦 Is products array?', Array.isArray(data.data?.products))

      if (data.success && data.data && data.data.products && Array.isArray(data.data.products)) {
        const normalizedProducts = data.data.products.map(normalizeProduct)
        kidsProducts.value = normalizedProducts
        console.log('✅ Kids products loaded:', normalizedProducts.length)
      } else {
        console.warn('⚠️ No kids products data received')
        console.warn('Debug info:', {
          success: data.success,
          hasData: !!data.data,
          hasProducts: !!data.data?.products,
          isArray: Array.isArray(data.data?.products)
        })
        kidsProducts.value = []
      }
    } catch (err) {
      console.error('❌ Error loading kids products:', err)
      kidsError.value = err.message
      kidsProducts.value = []
    } finally {
      kidsLoading.value = false
    }
  }

  // View product
  const viewProduct = (product) => {
    router.push({ name: 'ProductDetail', params: { id: product.id } })
  }

  // Add to cart
  const addToCart = (product) => {
    console.log('Adding to cart:', product.name)
    // TODO: Implement add to cart functionality
  }

  // Auto-load on mount
  onMounted(() => {
    // Auto-load will be called from parent component
  })

  return {
    // State
    kidsProducts,
    loading: kidsLoading,
    error: kidsError,
    kidsCarouselIndex,
    kidsScroller,

    // Actions
    loadKidsProducts,
    viewProduct,
    addToCart,
    getProductImages,
    getCurrentIndex,
    currentProductImage,
    nextImage,
    prevImage,
    scrollKids,
    startKidsAutoRotate,
    stopKidsAutoRotate,
    onKidsUserInteract
  }
}
