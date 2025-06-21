<template>
  <div>
    <!-- Use dynamic class binding for all classes to ensure consistency -->
    <div 
      :class="[
        'fixed', 'bottom-4', 'left-4', 'rounded-full', 'w-3', 'h-3', 
        'shadow-lg', 'cursor-pointer', statusColor
      ]"
      :title="titleText"
      @click="toggleDetails"
    ></div>
    
    <!-- Details panel -->
    <div v-if="showDetails" class="fixed bottom-12 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 max-w-md">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-semibold">API Status</h3>
        <button @click="toggleDetails" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <span class="sr-only">Close</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="space-y-2">
        <div v-if="paletteStore.offlineMode" class="text-yellow-600 dark:text-yellow-400 font-medium">
          Offline Mode Enabled
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Working with local data only. No API connection will be attempted.
          </p>
          <button 
            @click="paletteStore.toggleOfflineMode(false); refreshStatus()" 
            class="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Switch to Online Mode
          </button>
        </div>
        
        <div v-else>
          <div class="flex items-center">
            <div 
              class="w-3 h-3 rounded-full mr-2" 
              :class="healthStatus.isHealthy ? 'bg-green-500' : 'bg-red-500'"
            ></div>
            <span class="font-medium">
              {{ healthStatus.isHealthy ? 'API is healthy' : 'API is unavailable' }}
            </span>
          </div>
          
          <p v-if="healthStatus.error" class="text-sm text-red-500 mt-1">
            {{ healthStatus.error }}
          </p>
          
          <div v-if="!healthStatus.isHealthy && railsStatus?.isUp" class="mt-2">
            <div class="flex items-center">
              <div class="w-3 h-3 rounded-full mr-2 bg-yellow-500"></div>
              <span class="font-medium">Rails server is up</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Status: {{ railsStatus.status }} {{ railsStatus.statusText }}
            </p>
          </div>
          
          <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Last checked: {{ healthStatus.lastChecked ? new Date(healthStatus.lastChecked).toLocaleTimeString() : 'Never' }}
          </div>
          
          <div class="mt-3 flex space-x-2">
            <button 
              @click="refreshStatus" 
              class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Refresh Status
            </button>
            
            <button 
              @click="checkRailsStatus" 
              class="px-3 py-1 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
            >
              Check Rails
            </button>
            
            <button 
              @click="paletteStore.toggleOfflineMode(true)" 
              class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
            >
              Enable Offline Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiHealth } from '~/composables/useApiHealth'
import { usePaletteStore } from '~/stores/palettes'

// Define the interface for the railsStatus
interface RailsStatus {
  isUp: boolean;
  status: number;
  statusText: string;
}

const showDetails = ref(false)
const railsStatus = ref<RailsStatus | null>(null)

const { healthStatus, checkHealth, checkRailsUp } = useApiHealth()
const paletteStore = usePaletteStore()

// Initialize with a default state for SSR
const isClient = ref(false)
onMounted(() => {
  isClient.value = true
})

// Compute status color - ensure this is consistent between server and client
const statusColor = computed(() => {
  // For SSR, always use a default color to avoid hydration mismatch
  if (!isClient.value) return 'bg-yellow-500'
  
  // Client-side logic
  if (paletteStore.offlineMode) return 'bg-yellow-500'
  if (healthStatus.value.isChecking) return 'bg-blue-500'
  if (healthStatus.value.isHealthy) return 'bg-green-500'
  if (railsStatus.value?.isUp) return 'bg-yellow-500'
  return 'bg-red-500'
})

// Compute title text - ensure this is consistent between server and client
const titleText = computed(() => {
  // For SSR, always use a default title to avoid hydration mismatch
  if (!isClient.value) return 'Offline mode enabled'
  
  // Client-side logic
  if (paletteStore.offlineMode) return 'Offline mode enabled'
  if (healthStatus.value.isChecking) return 'Checking API status...'
  if (healthStatus.value.isHealthy) return 'API is healthy'
  if (railsStatus.value?.isUp) return 'Rails is up, but API is unavailable'
  return 'API is unavailable (click for details)'
})

// Toggle details panel
function toggleDetails() {
  showDetails.value = !showDetails.value
}

// Refresh API status
async function refreshStatus() {
  if (!paletteStore.offlineMode) {
    await checkHealth()
  }
}

// Check Rails status
async function checkRailsStatus() {
  if (!paletteStore.offlineMode) {
    railsStatus.value = await checkRailsUp()
  }
}

// Check API health on mount only if not in offline mode
onMounted(async () => {
  // Skip all API calls if in offline mode
  if (paletteStore.offlineMode) {
    healthStatus.value = {
      isHealthy: false,
      isChecking: false,
      lastChecked: new Date().toISOString(),
      data: null,
      error: 'Offline mode enabled'
    }
    return; // Exit early, don't try to check health
  }
  
  // Only proceed with health check if not in offline mode
  await checkHealth();
})
</script>
