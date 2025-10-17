import { ref, computed } from 'vue'
import { useStripeStore } from '@/stores/stripe'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'

export function usePayment() {
  const stripeStore = useStripeStore()
  const cartStore = useCartStore()
  const router = useRouter()

  // Payment state
  const loading = ref(false)
  const error = ref(null)
  const cardElement = ref(null)
  const stripeInitialized = ref(false)

  // Payment methods
  const paymentMethods = ref([
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      description: 'Pay securely with Visa, MasterCard, American Express',
      icon: '💳',
      selected: true
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      description: 'Pay with cash when your order arrives',
      icon: '💵',
      selected: false
    }
  ])

  // Initialize Stripe
  const initializeStripe = async () => {
    try {
      console.log('🚀 Initializing Stripe...')
      loading.value = true
      error.value = null

      // Get auth token
      const authToken = localStorage.getItem('auth_token') || ''

      // Initialize Stripe store
      await stripeStore.initialize(authToken)

      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100))

      // Mount card element
      await mountCardElement()

      stripeInitialized.value = true
      console.log('✅ Stripe initialized successfully')

    } catch (err) {
      console.error('❌ Stripe initialization failed:', err)
      error.value = err.message || 'Failed to initialize Stripe'
    } finally {
      loading.value = false
    }
  }

  // Mount Stripe card element
  const mountCardElement = async () => {
    try {
      // Wait for DOM to be ready and element to exist
      let container = document.getElementById('stripe-card-element')
      let attempts = 0
      const maxAttempts = 10

      while (!container && attempts < maxAttempts) {
        console.log(`⏳ Waiting for card element container... attempt ${attempts + 1}`)
        await new Promise(resolve => setTimeout(resolve, 200))
        container = document.getElementById('stripe-card-element')
        attempts++
      }

      if (!container) {
        throw new Error('Card element container not found after waiting')
      }

      console.log('✅ Card element container found, mounting...')

      // Clear container
      container.innerHTML = ''

      // Create card element
      const elements = stripeStore.stripe.elements({
        mode: 'payment',
        currency: 'usd',
        amount: 2000 // Will be updated with actual amount
      })

      cardElement.value = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            backgroundColor: 'transparent',
            '::placeholder': {
              color: '#a0a0a0',
            },
          },
          invalid: {
            color: '#ff6b6b',
          },
        },
        hidePostalCode: true,
      })

      // Mount the element
      cardElement.value.mount('#stripe-card-element')

      // Handle real-time validation
      cardElement.value.on('change', ({ error: cardError }) => {
        const displayError = document.getElementById('stripe-card-errors')
        if (displayError) {
          if (cardError) {
            displayError.textContent = cardError.message
          } else {
            displayError.textContent = ''
          }
        }
      })

      console.log('✅ Card element mounted successfully')

    } catch (err) {
      console.error('❌ Failed to mount card element:', err)
      throw err
    }
  }

  // Process payment
  const processPayment = async (orderData) => {
    try {
      console.log('💳 Processing payment...')
      loading.value = true
      error.value = null

      if (!stripeInitialized.value || !cardElement.value) {
        throw new Error('Stripe not initialized')
      }
      // Create payment intent with minimal order data
      const minimalOrderData = {
        total: orderData.total,
        subtotal: orderData.subtotal,
        items_count: orderData.items?.length || 0,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email
      }

      const response = await fetch('http://127.0.0.1:8000/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          amount: Math.round(orderData.total * 100), // Convert to cents
          currency: 'usd',
          order_data: minimalOrderData
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to create payment intent')
      }

      const { client_secret } = result.data

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripeStore.stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement.value,
          billing_details: {
            name: orderData.customer_name,
            email: orderData.customer_email
          }
        }
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      console.log('✅ Payment successful:', paymentIntent.id)
      return paymentIntent

    } catch (err) {
      console.error('❌ Payment failed:', err)
      error.value = err.message || 'Payment failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get cart total
  const cartTotal = computed(() => {
    return cartStore.totalPrice || 0
  })

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return {
    // State
    loading,
    error,
    stripeInitialized,
    paymentMethods,
    cartTotal,

    // Methods
    initializeStripe,
    processPayment,
    formatCurrency
  }
}
