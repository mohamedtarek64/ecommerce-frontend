// Profile JavaScript Logic
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'

export function useProfileState() {
  // Form data
  const profileForm = reactive({
    name: '',
    email: '',
    shippingAddress: {
      address: '',
      city: '',
      state: '',
      zip: ''
    },
    billingAddress: {
      address: '',
      city: '',
      state: '',
      zip: ''
    }
  })

  // UI state
  const isLoading = ref(false)
  const sameAsShipping = ref(true)

  return {
    profileForm,
    isLoading,
    sameAsShipping
  }
}

export function useProfileAuth() {
  const router = useRouter()
  const authStore = useAuthStore()
  const { user, isAuthenticated, handleLogout: authLogout } = useAuth()
  const { success, error: showError } = useNotifications()

  const isLoggedIn = computed(() => isAuthenticated.value)

  return {
    router,
    authStore,
    user,
    isAuthenticated,
    authLogout,
    success,
    showError,
    isLoggedIn
  }
}

export function useProfileActions() {
  // Create refs for success and error states
  const success = ref('')
  const showError = ref('')

  const toggleBillingAddress = (sameAsShipping, profileForm) => {
    if (sameAsShipping.value) {
      // Copy shipping address to billing
      profileForm.billingAddress = { ...profileForm.shippingAddress }
    }
  }

  const saveAddresses = async (shippingData, billingData) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      // Save shipping address
      if (shippingData.address_line_1) {
        console.log('Saving shipping address:', shippingData)
        const shippingResponse = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(shippingData)
        })

        if (shippingResponse.ok) {
          console.log('✅ Shipping address saved')
        } else {
          console.log('❌ Failed to save shipping address')
        }
      }

      // Save billing address
      if (billingData.address_line_1) {
        console.log('Saving billing address:', billingData)
        const billingResponse = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(billingData)
        })

        if (billingResponse.ok) {
          console.log('✅ Billing address saved')
        } else {
          console.log('❌ Failed to save billing address')
        }
      }
    } catch (error) {
      console.error('❌ Error saving addresses:', error)
    }
  }

  const loadAddresses = async (profileForm) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      console.log('Loading addresses...')
      const response = await fetch('/api/user/addresses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Addresses response:', result)

        if (result.success && result.data && result.data.length > 0) {
          const addresses = result.data

          // Find shipping address (home type)
          const shippingAddr = addresses.find(addr => addr.type === 'home')
          if (shippingAddr) {
            profileForm.shippingAddress = {
              address: shippingAddr.address_line_1 || '',
              city: shippingAddr.city || '',
              state: shippingAddr.state || '',
              zip: shippingAddr.postal_code || ''
            }
            console.log('✅ Loaded shipping address:', profileForm.shippingAddress)
          }

          // Find billing address (work type)
          const billingAddr = addresses.find(addr => addr.type === 'work')
          if (billingAddr) {
            profileForm.billingAddress = {
              address: billingAddr.address_line_1 || '',
              city: billingAddr.city || '',
              state: billingAddr.state || '',
              zip: billingAddr.postal_code || ''
            }
            console.log('✅ Loaded billing address:', profileForm.billingAddress)
          }
        } else {
          // Set default empty addresses
          profileForm.shippingAddress = { address: '', city: '', state: '', zip: '' }
          profileForm.billingAddress = { address: '', city: '', state: '', zip: '' }
        }
      } else {
        console.log('❌ Failed to load addresses')
        // Set default empty addresses
        profileForm.shippingAddress = { address: '', city: '', state: '', zip: '' }
        profileForm.billingAddress = { address: '', city: '', state: '', zip: '' }
      }
    } catch (error) {
      console.error('❌ Error loading addresses:', error)
      // Set default empty addresses
      profileForm.shippingAddress = { address: '', city: '', state: '', zip: '' }
      profileForm.billingAddress = { address: '', city: '', state: '', zip: '' }
    }
  }

  const loadUserData = async (profileForm, user) => {
    try {
      console.log('=== LOADING USER DATA ===')

      // First, try to load from localStorage as immediate fallback
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (storedUser.first_name) {
        profileForm.name = `${storedUser.first_name || ''} ${storedUser.last_name || ''}`.trim()
        profileForm.email = storedUser.email || ''
        console.log('✅ Loaded from localStorage immediately:', {
          name: profileForm.name,
          email: profileForm.email
        })
      }

      // Load profile data from database using user profile endpoint
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.log('❌ No auth token found')
        return
      }

      console.log('Loading from backend API...')
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      console.log('Profile API response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        console.log('Profile API response:', result)

        if (result.success) {
          const userData = result.data.user || result.data

          // Fill form with data from database
          profileForm.name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
          profileForm.email = userData.email || ''

          console.log('✅ Loaded profile data from backend:', {
            name: profileForm.name,
            email: profileForm.email
          })

          // Update auth store with fresh data
          if (user.value) {
            user.value.first_name = userData.first_name
            user.value.last_name = userData.last_name
            user.value.email = userData.email
            localStorage.setItem('user', JSON.stringify(user.value))
            console.log('✅ Updated auth store and localStorage')
          }

          // Load addresses
          await loadAddresses(profileForm)
        } else {
          console.log('❌ API returned success: false')
        }
      } else {
        console.log('❌ Profile API failed, trying auth user endpoint...')

        // Fallback to auth user endpoint
        const authResponse = await fetch('http://127.0.0.1:8000/api/auth/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (authResponse.ok) {
          const authResult = await authResponse.json()
          if (authResult.success) {
            const userData = authResult.data
            profileForm.name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
            profileForm.email = userData.email || ''
            console.log('✅ Loaded auth user data:', {
              name: profileForm.name,
              email: profileForm.email
            })
          }
        } else {
          console.log('❌ Auth user API also failed')
        }
      }

      console.log('=== FINAL PROFILE FORM STATE ===')
      console.log('Name:', profileForm.name)
      console.log('Email:', profileForm.email)

    } catch (error) {
      console.error('❌ Error loading profile data:', error)

      // Fallback to localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (storedUser.first_name) {
        profileForm.name = `${storedUser.first_name || ''} ${storedUser.last_name || ''}`.trim()
        profileForm.email = storedUser.email || ''
        console.log('✅ Using localStorage fallback after error:', {
          name: profileForm.name,
          email: profileForm.email
        })
      }
    }
  }

  const handleSubmit = async (profileForm, isLoading, success, showError, user, loadUserData) => {
    console.log('🔥 SAVE BUTTON CLICKED!')
    console.log('isLoading parameter:', isLoading)
    if (isLoading && isLoading.value !== undefined) {
      isLoading.value = true
    }

    try {
      // Prepare data for API
      const nameParts = profileForm.name.split(' ')
      const updateData = {
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: profileForm.email
      }

      // Prepare address data
      const shippingAddressData = {
        type: 'home',
        address_line_1: profileForm.shippingAddress.address,
        city: profileForm.shippingAddress.city,
        state: profileForm.shippingAddress.state,
        postal_code: profileForm.shippingAddress.zip,
        country: 'Egypt', // Default country
        is_default: true
      }

      const billingAddressData = {
        type: 'work',
        address_line_1: profileForm.billingAddress.address,
        city: profileForm.billingAddress.city,
        state: profileForm.billingAddress.state,
        postal_code: profileForm.billingAddress.zip,
        country: 'Egypt', // Default country
        is_default: false
      }

      console.log('=== SAVING PROFILE DATA ===')
      console.log('Form data:', profileForm)
      console.log('Update data to send:', updateData)
      console.log('Auth token:', localStorage.getItem('auth_token') ? 'exists' : 'missing')

      // Validate data
      if (!updateData.first_name || !updateData.email) {
        throw new Error('Name and email are required')
      }

      // Call backend API to update profile
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('Profile update response:', result)

        if (result.success) {
          console.log('✅ Profile updated successfully in database!')
          console.log('✅ Data saved to database:', result.data)
          if (success && success.value !== undefined) {
            success.value = 'Profile updated successfully!'
          }

          // Update user data in auth store
          if (user.value) {
            user.value.first_name = updateData.first_name
            user.value.last_name = updateData.last_name
            user.value.email = updateData.email
            console.log('✅ Updated user in store:', user.value)
          }

          // Update localStorage
          localStorage.setItem('user', JSON.stringify(user.value))
          console.log('✅ Updated localStorage with new data')

          // Save addresses if they have data
          console.log('🏠 Saving addresses...')
          await saveAddresses(shippingAddressData, billingAddressData)

          // Reload data to confirm it's saved
          console.log('🔄 Reloading data to confirm save...')
          await loadUserData(profileForm, user)

          console.log('🎉 PROFILE SAVE COMPLETED SUCCESSFULLY!')
        } else {
          console.error('❌ API returned success: false')
          throw new Error(result.message || 'Failed to update profile')
        }
      } else {
        let errorMessage = 'Failed to update profile'
        try {
          const errorData = await response.json()
          console.error('❌ Profile update error response:', errorData)
          errorMessage = errorData.message || errorData.errors || 'Failed to update profile'
        } catch (e) {
          console.error('❌ Could not parse error response')
        }
        throw new Error(errorMessage)
      }

    } catch (error) {
      console.error('❌ Profile update error:', error)
      if (showError && showError.value !== undefined) {
        showError.value = error.message || 'Failed to update profile. Please try again.'
      }
    } finally {
      if (isLoading && isLoading.value !== undefined) {
        isLoading.value = false
      }
    }
  }

  const handleLogout = async (authLogout, success, router, showError) => {
    try {
      await authLogout()
      if (success && success.value !== undefined) {
        success.value = 'Logged out successfully!'
      }
      router.push('/')
    } catch (error) {
      if (showError && showError.value !== undefined) {
        showError.value = 'Failed to logout. Please try again.'
      }
    }
  }

  return {
    toggleBillingAddress,
    saveAddresses,
    loadAddresses,
    loadUserData,
    handleSubmit,
    handleLogout,
    success,
    showError
  }
}

export function initializeProfile() {
  return {
    onMounted: async (authStore, user, isAuthenticated, router, loadUserData, profileForm) => {
      console.log('Profile component mounted')
      console.log('Initial user state:', user.value)
      console.log('Initial isAuthenticated:', isAuthenticated.value)

      // Check localStorage directly first
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      console.log('Stored token:', storedToken ? 'exists' : 'missing')
      console.log('Stored user:', storedUser)

      if (!storedToken || !storedUser.first_name) {
        console.log('No valid auth data found, redirecting to login')
        router.push('/login')
        return
      }

      // Initialize auth store
      console.log('Initializing auth store...')
      await authStore.initializeAuth()

      console.log('After auth init - user:', user.value)
      console.log('After auth init - isAuthenticated:', isAuthenticated.value)

      // Load user data immediately
      console.log('Loading user data on mount...')
      await loadUserData(profileForm, user)

      console.log('Final profile form state:', {
        name: profileForm.name,
        email: profileForm.email
      })
    }
  }
}
