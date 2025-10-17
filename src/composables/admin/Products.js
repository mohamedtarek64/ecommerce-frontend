// Admin Products JavaScript Logic
import { ref, computed, onMounted } from 'vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'

export function useProductsState() {
  // Products data
  const products = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const filters = ref({
    search: '',
    category: '',
    brand: '',
    status: ''
  })
  const pagination = ref({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1
  })
  const selectedProduct = ref(null)
  const showAddModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const showViewModal = ref(false)

  return {
    products,
    isLoading,
    error,
    filters,
    pagination,
    selectedProduct,
    showAddModal,
    showEditModal,
    showDeleteModal,
    showViewModal
  }
}

export function useProductsComputed(products, filters) {
  const filteredProducts = computed(() => {
    let filtered = products.value

    // Search filter
    if (filters.value.search) {
      const query = filters.value.search.toLowerCase()
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (filters.value.category && filters.value.category !== 'all') {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === filters.value.category.toLowerCase()
      )
    }

    // Brand filter
    if (filters.value.brand) {
      filtered = filtered.filter(product => product.brand === filters.value.brand)
    }

    // Status filter
    if (filters.value.status) {
      filtered = filtered.filter(product => product.status === filters.value.status)
    }

    return filtered
  })

  const totalProducts = computed(() => products.value.length)
  const activeProducts = computed(() => products.value.filter(product => product.status === 'active').length)
  const lowStockProducts = computed(() => products.value.filter(product => product.stock < 10).length)

  return {
    filteredProducts,
    totalProducts,
    activeProducts,
    lowStockProducts
  }
}

export function useProductsAPI(products, isLoading, error) {
  // Safety: create local refs if not provided
  const localLoading = ref(false)
  const localError = ref(null)
  const loadingRef = isLoading || localLoading
  const errorRef = error || localError
  const productsRef = products || ref([])

  const loadProducts = async () => {
    try {
      loadingRef.value = true
      errorRef.value = null

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
      const response = await fetch(`${API_BASE_URL}/admin/products-public`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('API Response:', result) // Debug log

      if (result.success) {
        productsRef.value = result.data || []
        console.log('Products loaded from API:', productsRef.value.length) // Debug log
        console.log('Products data:', productsRef.value) // Debug log
      } else {
        throw new Error(result.message || 'Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      errorRef.value = err.message
      productsRef.value = []
    } finally {
      loadingRef.value = false
    }
  }

  const createProduct = async (productData) => {
    try {
      loadingRef.value = true
      errorRef.value = null

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

      const response = await fetch(`${API_BASE_URL}/admin/products-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMsg = result.message || result.error || `HTTP error! status: ${response.status}`
        if (result.errors) {
          console.error('Validation errors:', result.errors)
        }
        throw new Error(errorMsg)
      }

        if (result.success) {
        await loadProducts() // Reload products
          return result.data
        } else {
        throw new Error(result.message || 'Failed to create product')
      }
    } catch (err) {
      console.error('Error creating product:', err)
      errorRef.value = err.message
      throw err
    } finally {
      loadingRef.value = false
    }
  }

  const updateProduct = async (productId, productData) => {
    try {
      loadingRef.value = true
      errorRef.value = null

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

        const result = await response.json()

        if (result.success) {
        await loadProducts() // Reload products
          return result.data
        } else {
          throw new Error(result.message || 'Failed to update product')
        }
    } catch (err) {
      console.error('Error updating product:', err)
      errorRef.value = err.message
      throw err
    } finally {
      loadingRef.value = false
    }
  }

  const deleteProduct = async (productId) => {
    try {
      loadingRef.value = true
      errorRef.value = null

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

        const result = await response.json()

        if (result.success) {
        await loadProducts() // Reload products
          return true
        } else {
          throw new Error(result.message || 'Failed to delete product')
        }
    } catch (err) {
      console.error('Error deleting product:', err)
      errorRef.value = err.message
      throw err
    } finally {
      loadingRef.value = false
    }
  }

  const deleteSelectedProducts = async (productIds) => {
    try {
      loadingRef.value = true
      errorRef.value = null

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')

      if (!productIds || productIds.length === 0) {
        throw new Error('No products selected for deletion')
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
      const response = await fetch(`${API_BASE_URL}/admin/delete-selected-test`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          product_ids: productIds
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        await loadProducts() // Reload products
        return result
      } else {
        throw new Error(result.message || 'Failed to delete selected products')
      }
    } catch (err) {
      console.error('Error deleting selected products:', err)
      errorRef.value = err.message
      throw err
    } finally {
      loadingRef.value = false
    }
  }

  return {
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteSelectedProducts
  }
}

export function useProductsActions() {
  const filterProducts = () => {
    // Filtering is handled by computed property
  }

  const searchProducts = () => {
    // Searching is handled by computed property
  }

  const exportProducts = () => {
    // Export functionality
    console.log('Exporting products...')
  }

  const deleteSelectedProducts = () => {
    // Delete selected products functionality
    console.log('Deleting selected products...')
  }

  return {
    filterProducts,
    searchProducts,
    exportProducts,
    deleteSelectedProducts
  }
}

export function useProductsUtils() {
  const { formatCurrency, formatDate, getStatusClass } = useAdminDashboard()

  const getProductStatus = (product) => product?.status || 'active'
  const getProductStatusClass = (status) => getStatusClass(status)

  return {
    formatCurrency,
    formatDate,
    getStatusClass,
    getProductStatus,
    getProductStatusClass
  }
}

// Forms for add/edit product flows
export function useProductsForms() {
  const addProductForm = ref({
    name: '',
    price: 0,
    description: '',
    sku: '',
    category: '',
    brand: '',
    stock: 0,
    status: 'active'
  })

  const editProductForm = ref({
    id: null,
    name: '',
    price: 0,
    description: '',
    sku: '',
    category: '',
    brand: '',
    stock: 0,
    status: 'active'
  })

  const resetAddForm = () => {
    addProductForm.value = {
      name: '',
      price: 0,
      description: '',
      sku: '',
      category: '',
      brand: '',
      stock: 0,
      status: 'active'
    }
  }

  const setEditForm = (product) => {
    if (!product) return
    editProductForm.value = {
      id: product.id ?? null,
      name: product.name ?? '',
      price: product.price ?? 0,
      description: product.description ?? '',
      sku: product.sku ?? '',
      category: product.category ?? '',
      brand: product.brand ?? '',
      stock: product.stock ?? 0,
      status: product.status ?? 'active'
    }
  }

  return {
    addProductForm,
    editProductForm,
    resetAddForm,
    setEditForm
  }
}

export function initializeProducts() {
  return {
    onMounted: (loadProducts) => {
      loadProducts()
    }
  }
}
