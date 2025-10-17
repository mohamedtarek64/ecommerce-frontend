<template>
  <div class="admin-invoices">
    <div class="relative flex size-full min-h-screen flex-col bg-[#1C1C1C] overflow-x-hidden">
      <div class="flex flex-col lg:flex-row h-full grow">
        <!-- Sidebar (reuse AdminDashboard layout style) -->
        <AdminSidebar />

        <!-- Main Content -->
        <main class="flex-1 p-6 md:p-8">
          <header class="flex items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 class="text-3xl font-bold text-white">Invoices</h2>
              <p class="text-gray-400 mt-1">Manage customer invoices</p>
            </div>
            <button @click="goCreate" class="flex items-center gap-2 bg-[#f97306] text-white font-bold py-2 px-4 rounded hover:opacity-90">
              <span class="material-symbols-outlined">add_circle</span>
              <span>Generate New Invoice</span>
            </button>
          </header>

          <section class="bg-[#232323] rounded-xl overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm text-left">
                <thead class="bg-[#1f1f1f]">
                  <tr>
                    <th class="p-4 font-semibold tracking-wider text-gray-300" scope="col">Invoice</th>
                    <th class="p-4 font-semibold tracking-wider text-gray-300" scope="col">Customer</th>
                    <th class="p-4 font-semibold tracking-wider text-gray-300" scope="col">Issue Date</th>
                    <th class="p-4 font-semibold tracking-wider text-gray-300" scope="col">Due Date</th>
                    <th class="p-4 font-semibold tracking-wider text-gray-300 text-right" scope="col">Amount</th>
                    <th class="p-4 font-semibold tracking-wider text-gray-300 text-center" scope="col">Status</th>
                    <th class="p-4 font-semibold tracking-wider text-gray-300 text-center" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                  <tr v-for="inv in invoices" :key="inv.id">
                    <td class="p-4 whitespace-nowrap font-medium text-white">{{ inv.invoice_number }}</td>
                    <td class="p-4 whitespace-nowrap text-gray-300">{{ inv.user?.name || 'N/A' }}</td>
                    <td class="p-4 whitespace-nowrap text-gray-400">{{ formatDate(inv.created_at) }}</td>
                    <td class="p-4 whitespace-nowrap text-gray-400">{{ inv.due_date ? formatDate(inv.due_date) : '—' }}</td>
                    <td class="p-4 whitespace-nowrap font-medium text-right text-white">{{ formatCurrency(inv.total_amount) }}</td>
                    <td class="p-4 text-center">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="statusClass(inv.status)">{{ statusText(inv.status) }}</span>
                    </td>
                    <td class="p-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <router-link :to="`/invoices/${inv.id}`" class="p-1 text-gray-300 hover:text-white transition">
                          <span class="material-symbols-outlined text-xl">visibility</span>
                        </router-link>
                        <button class="p-1 text-gray-300 hover:text-white transition" @click="download(inv.id)">
                          <span class="material-symbols-outlined text-xl">download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!invoices || invoices.length === 0">
                    <td colspan="7" class="p-6 text-center text-gray-400">No invoices found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoices } from '@/composables/useInvoices'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

const router = useRouter()
const { invoices, fetchInvoices, formatCurrency, formatDate, getStatusText: statusText, downloadInvoice: download } = useInvoices()

const goCreate = () => router.push('/invoices/create')

const statusClass = (status) => {
  const map = {
    paid: 'bg-green-600/20 text-green-400',
    sent: 'bg-blue-600/20 text-blue-400',
    draft: 'bg-gray-600/20 text-gray-300',
    cancelled: 'bg-red-600/20 text-red-400'
  }
  return map[status] || map.draft
}

onMounted(() => {
  fetchInvoices()
})
</script>

<style scoped>
.admin-invoices { min-height: 100vh; background-color: #1C1C1C; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24 }
</style>
