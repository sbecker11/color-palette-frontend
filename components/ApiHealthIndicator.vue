<template>
  <div class="api-health-indicator">
    <!-- Status badge that's always visible -->
    <div 
      class="fixed bottom-4 left-4 rounded-full w-3 h-3 shadow-lg cursor-pointer"
      :class="statusColor"
      @click="toggleDetails"
      :title="statusTitle"
    ></div>
    
    <!-- Detailed panel that shows when clicked -->
    <div 
      v-if="showDetails" 
      class="fixed bottom-12 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-md"
    >
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold text-lg">API Status</h3>
        <button @click="toggleDetails" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div v-if="healthStatus.isChecking" class="text-center py-4">
        <p>Checking API status...</p>
      </div>
      
      <div v-else>
        <div class="flex items-center mb-2">
          <div 
            class="w-3 h-3 rounded-full mr-2"
            :class="statusColor"
          ></div>
          <span class="font-medium">{{ statusText }}</span>
        </div>
        
        <div v-if="healthStatus.data" class="text-sm space-y-1 mt-3">
          <p><span class="font-medium">Version:</span> {{ healthStatus.data.version }}</p>
          <p><span class="font-medium">Environment:</span> {{ healthStatus.data.environment }}</p>
          <p><span class="font-medium">Database:</span> {{ healthStatus.data.database_connection ? 'Connected' : 'Disconnected' }}</p>
          <p><span class="font-medium">Rails:</span> {{ healthStatus.data.rails_version }}</p>
          <p><span class="font-medium">Last checked:</span> {{ formattedLastChecked }}</p>
        </div>
        
        <div v-if="healthStatus.error" class="text-sm text-red-600 mt-2">
          {{ healthStatus.error }}
        </div>
        
        <div class="mt-4 flex space-x-2">
          <button 
            @click="refreshStatus" 
            class="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm"
          >
            Refresh
          </button>
          <button 
            v-if="!healthStatus.isHealthy"
            @click="checkRailsStatus" 
            class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
          >
            Check Rails
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiHealth } from '~/composables/useApiHealth'

const showDetails = ref(false)
const railsStatus = ref<{ isUp: boolean; status: number; statusText: string } | null>(null)

const { healthStatus, checkHealth, checkRailsUp } = useApiHealth()

// Format the last checked timestamp
const formattedLastChecked = computed(() => {
  if (!healthStatus.value.lastChecked) return 'Never'
  
  try {
    const date = new Date(healthStatus.value.lastChecked)
    return date.toLocaleString()
  } catch (e) {
    return healthStatus.value.lastChecked
  }
})

// Compute status text
const statusText = computed(() => {
  if (healthStatus.value.isChecking) return 'Checking...'
  if (healthStatus.value.isHealthy) return 'API is healthy'
  if (railsStatus.value?.isUp) return 'Rails is up, but API may be unavailable'
  return 'API is unavailable'
})

// Compute status title for the indicator dot
const statusTitle = computed(() => {
  if (healthStatus.value.isChecking) return 'Checking API status...'
  if (healthStatus.value.isHealthy) return 'API is healthy'
  return 'API is unavailable (click for details)'
})

// Compute status color
const statusColor = computed(() => {
  if (healthStatus.value.isChecking) return 'bg-blue-500'
  if (healthStatus.value.isHealthy) return 'bg-green-500'
  if (railsStatus.value?.isUp) return 'bg-yellow-500'
  return 'bg-red-500'
})

// Toggle details panel
function toggleDetails() {
  showDetails.value = !showDetails.value
}

// Refresh API status
async function refreshStatus() {
  await checkHealth()
}

// Check Rails status
async function checkRailsStatus() {
  railsStatus.value = await checkRailsUp()
}

// Check API health on mount
onMounted(async () => {
  await checkHealth()
})
</script>