<template>
  <div class="admin-dashboard">
    <div class="relative flex size-full min-h-screen flex-col bg-[#1C1C1C] dark group/design-root overflow-x-hidden">
      <div class="flex flex-col lg:flex-row h-full grow">
        <!-- Sidebar -->
        <AdminSidebar />

        <!-- Main Content -->
        <main class="flex-1 p-6 md:p-8">
          <!-- Header -->
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <p class="text-white text-3xl font-bold">Discount Codes</p>
              <p class="text-gray-400">Manage discount codes and promotions</p>
            </div>
            <div class="flex gap-2">
              <!-- Quick Admin Login Button -->
              <button
                v-if="!isLoggedIn"
                @click="quickAdminLogin"
                class="flex items-center justify-center rounded-md h-10 px-4 bg-green-600 text-white text-sm font-medium hover:bg-green-700 gap-2"
              >
                🔑
                <span class="truncate">Quick Admin Login</span>
              </button>
          <button
            @click="loadDiscountCodes"
            :disabled="loading"
            class="flex items-center justify-center rounded-md h-10 px-4 bg-[#2C2C2C] text-white text-sm font-medium hover:bg-[#3A3A3A] gap-2 disabled:opacity-50"
          >
            <span :class="{ 'animate-spin': loading }">🔄</span>
            <span class="truncate">{{ loading ? 'Loading...' : 'Refresh' }}</span>
          </button>
              <button
                @click="openCreateModal"
                class="flex items-center justify-center rounded-md h-10 px-4 bg-[#f97306] text-white text-sm font-medium hover:bg-[#e06500] gap-2"
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
            <div class="flex items-center gap-2">
              <span class="text-4xl mb-2">⚠️</span>
              <span>{{ error }}</span>
            </div>
          </div>

          <!-- Stats Cards -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <p class="text-gray-300 text-base font-medium">Total Codes</p>
              <p class="text-white text-3xl font-bold">{{ totalCodes }}</p>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <p class="text-gray-300 text-base font-medium">Active Codes</p>
              <p class="text-white text-3xl font-bold">{{ activeCodes }}</p>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <p class="text-gray-300 text-base font-medium">Expired Codes</p>
              <p class="text-white text-3xl font-bold">{{ expiredCodes }}</p>
            </div>
            <div class="flex flex-col gap-2 rounded-md p-6 bg-[#232323]">
              <p class="text-gray-300 text-base font-medium">Total Usage</p>
              <p class="text-white text-3xl font-bold">{{ totalUsageCount }}</p>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-[#232323] p-6 rounded-md mb-8">
            <div class="flex flex-col md:flex-row gap-4">
              <div class="flex-1">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search by code or name..."
                  class="w-full px-4 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none"
                />
              </div>
              <div class="flex gap-2">
                <select
                  v-model="filterStatus"
                  class="px-4 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white focus:border-[#f97306] focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
                <select
                  v-model="filterType"
                  class="px-4 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white focus:border-[#f97306] focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Discount Codes Table -->
          <div class="bg-[#232323] rounded-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-[#2C2C2C]">
                  <tr>
                    <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Code</th>
                    <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Name</th>
                    <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Type</th>
                    <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Value</th>
                    <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Min. Amount</th>
                    <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Usage</th>
                    <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                    <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Expires At</th>
                    <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#3A3A3A]">
                  <tr v-for="code in filteredDiscountCodes" :key="code.id" class="hover:bg-[#2C2C2C]">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <span class="text-white font-mono">{{ code.code }}</span>
                        <button @click="copyCode(code.code)" class="text-[#f97306] hover:text-white">
                          <i class="fas fa-copy"></i>
                        </button>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-white">{{ code.name }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-white">{{ code.type }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-white">
                      {{ code.type === 'percentage' ? code.value + '%' : formatCurrency(code.value) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-white">
                      {{ code.minimum_amount ? formatCurrency(code.minimum_amount) : 'N/A' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-white">
                      {{ code.used_count }} / {{ code.usage_limit || '∞' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['px-2 py-1 rounded-full text-xs font-medium', getStatusClass(code)]">
                        {{ getStatusText(code) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-white">
                      {{ code.expires_at ? formatDate(code.expires_at) : 'N/A' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex gap-1">
                        <button
                          @click="openViewModal(code)"
                          class="group relative p-2 rounded-lg hover:bg-purple-500/10 transition-all duration-200 hover:scale-105"
                          title="View Code Details"
                        >
                          <span class="text-lg group-hover:text-purple-400 transition-colors">👁️</span>
                          <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            View
                          </div>
                        </button>
                        <button
                          @click="openEditModal(code)"
                          class="group relative p-2 rounded-lg hover:bg-blue-500/10 transition-all duration-200 hover:scale-105"
                          title="Edit Code"
                        >
                          <span class="text-lg group-hover:text-blue-400 transition-colors">✏️</span>
                          <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Edit
                          </div>
                        </button>
                        <button
                          @click="copyCode(code.code)"
                          class="group relative p-2 rounded-lg hover:bg-green-500/10 transition-all duration-200 hover:scale-105"
                          title="Copy Code to Clipboard"
                        >
                          <span class="text-lg group-hover:text-green-400 transition-colors">📋</span>
                          <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Copy
                          </div>
                        </button>
                        <button
                          @click="deleteDiscountCode(code.id)"
                          class="group relative p-2 rounded-lg hover:bg-red-500/10 transition-all duration-200 hover:scale-105"
                          title="Delete Code"
                        >
                          <span class="text-lg group-hover:text-red-400 transition-colors">🗑️</span>
                          <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Delete
                          </div>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="filteredDiscountCodes.length === 0" class="text-center py-8 text-gray-400">
                <span class="text-4xl mb-2">🏷️</span>
                <p>No discount codes found</p>
              </div>
            </div>
          </div>

          <!-- Create/Edit Modal -->
          <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-[#232323] rounded-md w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div class="flex justify-between items-center p-6 border-b border-[#3A3A3A]">
                <h2 class="text-white text-xl font-bold">{{ isEditMode ? 'Edit Discount Code' : 'Create New Discount Code' }}</h2>
                <button @click="closeModal" class="text-gray-400 hover:text-white text-xl">
                  ✕
                </button>
              </div>
              <form @submit.prevent="saveDiscountCode" class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Code (Optional)</label>
                    <input
                      type="text"
                      v-model="currentCode.code"
                      :disabled="isEditMode"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      v-model="currentCode.name"
                      required
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      v-model="currentCode.description"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none"
                      rows="3"
                    ></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      v-model="currentCode.type"
                      required
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white focus:border-[#f97306] focus:outline-none"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Value</label>
                    <input
                      type="number"
                      v-model="currentCode.value"
                      step="0.01"
                      min="0"
                      required
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Minimum Amount</label>
                    <input
                      type="number"
                      v-model="currentCode.minimum_amount"
                      step="0.01"
                      min="0"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Usage Limit</label>
                    <input
                      type="number"
                      v-model="currentCode.usage_limit"
                      min="1"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white placeholder-gray-400 focus:border-[#f97306] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Starts At</label>
                    <input
                      type="datetime-local"
                      v-model="currentCode.starts_at"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white focus:border-[#f97306] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Expires At</label>
                    <input
                      type="datetime-local"
                      v-model="currentCode.expires_at"
                      class="w-full px-3 py-2 bg-[#2C2C2C] border border-[#3A3A3A] rounded-md text-white focus:border-[#f97306] focus:outline-none"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        v-model="currentCode.is_active"
                        class="rounded border-[#3A3A3A] bg-[#2C2C2C] text-[#f97306] focus:border-[#f97306] focus:ring-0"
                      />
                      <span class="text-sm font-medium text-gray-300">Is Active</span>
                    </label>
                  </div>
                </div>
                <div v-if="modalError" class="mt-4 p-3 bg-red-900/20 border border-red-500/50 text-red-300 rounded-md">
                  {{ modalError }}
                </div>
                <div class="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 bg-[#2C2C2C] text-white rounded-md hover:bg-[#3A3A3A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="px-4 py-2 bg-[#f97306] text-white rounded-md hover:bg-[#e06500] disabled:opacity-50"
                  >
                    <span v-if="loading" class="animate-spin mr-2">⏳</span>
                    {{ isEditMode ? 'Update Code' : 'Create Code' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Confirmation Modal -->
          <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div class="bg-[#232323] rounded-xl w-full max-w-md mx-4 shadow-2xl border border-[#3A3A3A]">
              <div class="p-6">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <span class="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <h3 class="text-white text-xl font-bold">Delete Discount Code</h3>
                    <p class="text-gray-400 text-sm">This action cannot be undone</p>
                  </div>
                </div>

                <div class="mb-6">
                  <p class="text-gray-300 leading-relaxed">
                    Are you sure you want to delete this discount code? This action cannot be undone and will permanently remove the code from your system.
                  </p>
                </div>

                <div class="flex gap-3">
                  <button
                    @click="cancelDelete"
                    class="flex-1 px-4 py-3 bg-[#2C2C2C] text-gray-300 rounded-lg hover:bg-[#3A3A3A] transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    @click="confirmDelete"
                    class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="showToast" class="fixed top-4 right-4 z-50 animate-slide-in">
      <div :class="[
        'px-6 py-4 rounded-lg shadow-lg border-l-4 flex items-center gap-3 min-w-80',
        toastType === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' : 'bg-red-900/90 border-red-500 text-red-100'
      ]">
        <span class="text-xl">
          {{ toastType === 'success' ? '✅' : '❌' }}
        </span>
        <div>
          <p class="font-medium">{{ toastMessage }}</p>
        </div>
        <button
          @click="showToast = false"
          class="ml-auto text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import {
  useDiscountCodesState,
  useDiscountCodesComputed,
  useDiscountCodesAPI,
  useDiscountCodesActions,
  useDiscountCodesUtils
} from '@/composables/admin/DiscountCodes.js'

// State
const {
  isModalOpen,
  isEditMode,
  currentCode,
  modalError,
  showConfirmModal,
  codeToDelete,
  showToast,
  toastMessage,
  toastType,
  searchQuery,
  filterStatus,
  filterType,
  discountCodes,
  loading,
  error
} = useDiscountCodesState()

// Computed
const {
  filteredDiscountCodes,
  totalCodes,
  activeCodes,
  expiredCodes
} = useDiscountCodesComputed(discountCodes, searchQuery, filterStatus, filterType)

// Additional computed property
const totalUsageCount = computed(() => {
  return discountCodes.value?.reduce((total, code) => total + (code.usage_count || 0), 0) || 0
})

// API
const { loadDiscountCodes, createDiscountCode, updateDiscountCode, deleteDiscountCodeAPI } = useDiscountCodesAPI(discountCodes, loading, error)

// Actions
const {
  openCreateModal: openCreateModalAction,
  openEditModal: openEditModalAction,
  openViewModal: openViewModalAction,
  closeModal: closeModalAction,
  deleteDiscountCode: deleteDiscountCodeAction,
  confirmDelete: confirmDeleteAction,
  cancelDelete: cancelDeleteAction,
  copyCode: copyCodeAction,
  showToastMessage: showToastMessageAction
} = useDiscountCodesActions()

// Wrapper functions with proper parameters
const openCreateModal = () => {
  openCreateModalAction(isModalOpen, isEditMode, currentCode, modalError)
}

const openEditModal = (code) => {
  openEditModalAction(code, isModalOpen, isEditMode, currentCode, modalError)
}

const openViewModal = (code) => {
  openViewModalAction(code, isModalOpen, isEditMode, currentCode, modalError)
}

const closeModal = () => {
  closeModalAction(isModalOpen, modalError)
}

const deleteDiscountCode = (id) => {
  deleteDiscountCodeAction(id, codeToDelete, showConfirmModal)
}

const confirmDelete = async () => {
  await confirmDeleteAction(codeToDelete, discountCodes, showConfirmModal, showToastMessage, deleteDiscountCodeAPI)
}

const cancelDelete = () => {
  cancelDeleteAction(showConfirmModal, codeToDelete)
}

const copyCode = async (code) => {
  await copyCodeAction(code, showToastMessage)
}

const showToastMessage = (message, type) => {
  showToastMessageAction(message, type, toastMessage, toastType, showToast)
}

// Utils
const { getStatusClass, formatCurrency, formatDate } = useDiscountCodesUtils()

// Local helper function
const getStatusText = (code) => {
  const now = new Date()
  const expiresAt = code.expires_at ? new Date(code.expires_at) : null

  if (!code.is_active) {
    return 'Inactive'
  }

  if (expiresAt && expiresAt <= now) {
    return 'Expired'
  }

  return 'Active'
}

// Check if user is logged in
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('auth_token')
})

// Quick admin login function
const quickAdminLogin = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@solemate.com',
        password: 'password'
      })
    })

    const data = await response.json()

    if (data.success) {
      // Store token
      localStorage.setItem('auth_token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      // Show success message
      alert('Admin login successful! You can now create discount codes.')

      // Reload the page to refresh the state
      window.location.reload()
    } else {
      alert('Login failed: ' + data.message)
    }
  } catch (error) {
    alert('Error: ' + error.message)
  }
}

// Initialize
onMounted(async () => {
  await loadDiscountCodes()
})
</script>

<style scoped>
@import '@/styles/admin/DiscountCodes.css';
</style>
