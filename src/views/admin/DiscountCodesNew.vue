<template>
  <div class="admin-dashboard">
    <div class="relative flex size-full min-h-screen flex-col bg-[#1C1C1C] dark group/design-root overflow-x-hidden">
      <div class="flex flex-col lg:flex-row h-full grow">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="flex flex-col gap-y-6">
            <div class="sidebar-header">
              <div class="logo"></div>
              <h1 class="logo-text">SoleMate</h1>
            </div>
            <nav class="nav-menu">
              <router-link to="/admin/dashboard" class="nav-link">
                <i class="fas fa-tachometer-alt"></i>
                <p class="text-sm font-medium leading-normal">Dashboard</p>
              </router-link>
              <router-link to="/admin/products" class="nav-link">
                <i class="fas fa-box"></i>
                <p class="text-sm font-medium leading-normal">Products</p>
              </router-link>
              <router-link to="/admin/orders" class="nav-link">
                <i class="fas fa-shopping-cart"></i>
                <p class="text-sm font-medium leading-normal">Orders</p>
              </router-link>
              <router-link to="/admin/customers" class="nav-link">
                <i class="fas fa-users"></i>
                <p class="text-sm font-medium leading-normal">Customers</p>
              </router-link>
              <router-link to="/admin/analytics" class="nav-link">
                <i class="fas fa-chart-bar"></i>
                <p class="text-sm font-medium leading-normal">Analytics</p>
              </router-link>
              <router-link to="/admin/discount-codes" class="nav-link active">
                <i class="fas fa-percent text-white"></i>
                <p class="text-white text-sm font-medium leading-normal">Discount Codes</p>
              </router-link>
              <router-link to="/admin/settings" class="nav-link">
                <i class="fas fa-cog"></i>
                <p class="text-sm font-medium leading-normal">Settings</p>
              </router-link>
            </nav>
          </div>
          <div class="sidebar-footer">
            <button class="add-product-btn">
              <i class="fas fa-plus"></i>
              <span class="truncate">Add Product</span>
            </button>
            <a class="help-link" href="#">
              <i class="fas fa-question-circle"></i>
              <p class="text-sm font-medium leading-normal">Help and Docs</p>
            </a>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <!-- Header -->
          <div class="page-header">
            <div>
              <p class="page-title">Discount Codes</p>
              <p class="page-subtitle">Manage discount codes and promotions</p>
            </div>
            <div class="header-actions">
              <!-- Quick Admin Login Button -->
              <button
                v-if="!isLoggedIn"
                @click="quickAdminLogin"
                class="action-btn quick-login-btn"
              >
                🔑
                <span class="truncate">Quick Admin Login</span>
              </button>
              <button
                @click="loadDiscountCodes"
                :disabled="loading"
                class="action-btn refresh-btn"
              >
                <span :class="{ 'spinning': loading }">🔄</span>
                <span class="truncate">{{ loading ? 'Loading...' : 'Refresh' }}</span>
              </button>
              <button
                @click="openCreateModal"
                class="action-btn add-code-btn"
              >
                ➕
                <span class="truncate">Add New Code</span>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div v-for="i in 4" :key="i" class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <div class="h-4 bg-gray-700 rounded animate-pulse"></div>
              <div class="h-8 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="mb-8 p-4 bg-red-900/20 border border-red-500/50 text-red-300 rounded-md">
            <p class="font-medium">Error loading discount codes</p>
            <p class="text-sm mt-1">{{ error }}</p>
          </div>

          <!-- Discount Codes Table -->
          <div v-else class="discount-codes-table">
            <div class="table-header">
              <h3 class="table-title">Discount Codes</h3>
            </div>
            <div class="table-content">
              <table class="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Min Amount</th>
                    <th>Usage Limit</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="code in discountCodes" :key="code.id">
                    <td>
                      <span class="code-badge">{{ code.code }}</span>
                    </td>
                    <td>{{ code.description }}</td>
                    <td>{{ code.type }}</td>
                    <td>{{ formatCurrency(code.value) }}</td>
                    <td>{{ formatCurrency(code.minimum_amount) }}</td>
                    <td>{{ code.usage_limit }}</td>
                    <td>
                      <span :class="getStatusBadgeClass(code.status)">
                        {{ code.status }}
                      </span>
                    </td>
                    <td>
                      <div class="actions">
                        <button
                          @click="openViewModal(code)"
                          class="action-icon action-view"
                          title="View Code"
                        >
                          👁️
                        </button>
                        <button
                          @click="openEditModal(code)"
                          class="action-icon action-edit"
                          title="Edit Code"
                        >
                          ✏️
                        </button>
                        <button
                          @click="copyCode(code.code)"
                          class="action-icon action-copy"
                          title="Copy Code"
                        >
                          📋
                        </button>
                        <button
                          @click="deleteDiscountCode(code.id)"
                          class="action-icon action-delete"
                          title="Delete Code"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Create/Edit Modal -->
          <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal" @click.stop>
              <div class="modal-header">
                <h3 class="modal-title">{{ isEditing ? 'Edit Discount Code' : 'Create New Discount Code' }}</h3>
                <button @click="closeModal" class="modal-close">×</button>
              </div>

              <form @submit.prevent="saveDiscountCode">
                <div class="form-group">
                  <label class="form-label">Discount Code</label>
                  <input
                    v-model="formData.code"
                    type="text"
                    class="form-input"
                    placeholder="Enter discount code"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Description</label>
                  <textarea
                    v-model="formData.description"
                    class="form-textarea"
                    placeholder="Enter description"
                    required
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">Type</label>
                  <select v-model="formData.type" class="form-select" required>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Value</label>
                  <input
                    v-model="formData.value"
                    type="number"
                    class="form-input"
                    placeholder="Enter value"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Minimum Amount</label>
                  <input
                    v-model="formData.minimum_amount"
                    type="number"
                    class="form-input"
                    placeholder="Enter minimum amount"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Usage Limit</label>
                  <input
                    v-model="formData.usage_limit"
                    type="number"
                    class="form-input"
                    placeholder="Enter usage limit"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Start Date</label>
                  <input
                    v-model="formData.starts_at"
                    type="datetime-local"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Expiration Date</label>
                  <input
                    v-model="formData.expires_at"
                    type="datetime-local"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-actions">
                  <button type="button" @click="closeModal" class="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    {{ saving ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Confirmation Modal -->
          <div v-if="showConfirmModal" class="modal-overlay" @click="cancelDelete">
            <div class="confirm-modal" @click.stop>
              <div class="confirm-icon">⚠️</div>
              <h3 class="confirm-title">Confirm Delete</h3>
              <p class="confirm-message">Are you sure you want to delete this discount code? This action cannot be undone.</p>
              <div class="confirm-actions">
                <button @click="cancelDelete" class="btn btn-secondary">Cancel</button>
                <button @click="confirmDelete" class="btn btn-danger">Delete</button>
              </div>
            </div>
          </div>

          <!-- Toast Container -->
          <div class="toast-container"></div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  formatCurrency,
  formatDate,
  generateDiscountCode,
  getStatusBadgeClass,
  copyToClipboard,
  showToast,
  showConfirmationModal,
  loadDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  quickAdminLogin,
  getDefaultFormData
} from '@/composables/admin/DiscountCodesHelpers.js'

// Reactive data
const discountCodes = ref([])
const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const showConfirmModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const isLoggedIn = ref(false)
const codeToDelete = ref(null)
const formData = ref(getDefaultFormData())

// Methods
const loadDiscountCodesData = async () => {
  try {
    loading.value = true
    error.value = null
    const result = await loadDiscountCodes()
    discountCodes.value = result.data || []
  } catch (err) {
    error.value = err.message
    console.error('Error loading discount codes:', err)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  formData.value = getDefaultFormData()
  isEditing.value = false
  showModal.value = true
}

const openEditModal = (code) => {
  formData.value = { ...code }
  isEditing.value = true
  showModal.value = true
}

const openViewModal = (code) => {
  // Implementation for view modal
  console.log('View code:', code)
}

const closeModal = () => {
  showModal.value = false
  formData.value = getDefaultFormData()
  isEditing.value = false
}

const saveDiscountCode = async () => {
  try {
    saving.value = true

    if (isEditing.value) {
      await updateDiscountCode(formData.value.id, formData.value)
      showToast('Discount code updated successfully!')
    } else {
      await createDiscountCode(formData.value)
      showToast('Discount code created successfully!')
    }

    closeModal()
    await loadDiscountCodesData()
  } catch (err) {
    showToast(err.message, 'error')
  } finally {
    saving.value = false
  }
}

const copyCode = async (code) => {
  const success = await copyToClipboard(code)
  if (success) {
    showToast('Code copied to clipboard!')
  } else {
    showToast('Failed to copy code', 'error')
  }
}

const deleteDiscountCodeHandler = (id) => {
  codeToDelete.value = id
  showConfirmModal.value = true
}

const confirmDelete = async () => {
  try {
    await deleteDiscountCode(codeToDelete.value)
    showToast('Discount code deleted successfully!')
    showConfirmModal.value = false
    codeToDelete.value = null
    await loadDiscountCodesData()
  } catch (err) {
    showToast(err.message, 'error')
  }
}

const cancelDelete = () => {
  showConfirmModal.value = false
  codeToDelete.value = null
}

const quickAdminLoginHandler = async () => {
  const success = await quickAdminLogin()
  if (success) {
    isLoggedIn.value = true
    showToast('Logged in successfully!')
    await loadDiscountCodesData()
  } else {
    showToast('Login failed', 'error')
  }
}

// Lifecycle
onMounted(() => {
  const token = localStorage.getItem('auth_token')
  isLoggedIn.value = !!token

  if (isLoggedIn.value) {
    loadDiscountCodesData()
  }
})
</script>

<style scoped>
@import '@/styles/admin/DiscountCodes.css';
</style>
