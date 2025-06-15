<template>
  <div v-if="usingMockData" class="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg z-50">
    <div class="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <span>Using mock data (API unavailable)</span>
    </div>
    <div class="text-xs mt-1">
      <p class="mb-1">API Status: {{ apiStatus }}</p>
      <p class="mb-1">Health check URL: {{ healthCheckUrl }}</p>
      <p v-if="errorMessage" class="mb-1 text-red-600">Error: {{ errorMessage }}</p>
      
      <div v-if="apiStatus === 'Failed to fetch'" class="mb-1 text-red-600">
        <p>The API server appears to be unreachable. This could be due to:</p>
        <ul class="list-disc ml-4">
          <li>The API server is not running</li>
          <li>Network connectivity issues</li>
          <li>CORS policy blocking the request</li>
          <li>Firewall or security settings</li>
        </ul>
        <p class="mt-1">Please check that the API server is running at: {{ apiUrl }}</p>
      </div>
      
      <div v-if="apiStatus === '500 Error'" class="mb-1 text-red-600">
        <p>The API server is running but the health endpoint returned a 500 error.</p>
        <p>This usually indicates an error in the API's health check implementation.</p>
        <p>The Rails application is running (confirmed via /up endpoint).</p>
      </div>
      
      <div class="flex space-x-2 mt-2">
        <button 
          @click="retryConnection" 
          class="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-2 py-1 rounded text-xs"
        >
          Retry connection
        </button>
        <button 
          v-if="apiStatus === 'Unknown' || apiStatus === '500 Error'"
          @click="checkUpEndpoint" 
          class="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-2 py-1 rounded text-xs"
        >
          Try /up endpoint
        </button>
        <button 
          v-if="apiStatus === '500 Error'"
          @click="tryWithAuth" 
          class="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-2 py-1 rounded text-xs"
        >
          Try with auth
        </button>
        <button 
          v-if="apiStatus === 'Failed to fetch'"
          @click="checkServerStatus" 
          class="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-2 py-1 rounded text-xs"
        >
          Check server
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const usingMockData = ref(false)
const retryCount = ref(0)
const apiStatus = ref('Unknown')
const errorMessage = ref('')
const config = useRuntimeConfig()
const serverStatus = ref<string | null>(null)

// Get the API URL from the runtime config
const apiUrl = computed(() => {
  return config.public.apiBase || 'http://localhost:3001/api/v1'
})

// Get the health check URL
const healthCheckUrl = computed(() => {
  return `${apiUrl.value}/health`
})

// Get the base URL (without /api/v1)
const baseUrl = computed(() => {
  return apiUrl.value.replace(/\/api\/v1$/, '')
})

// Function to try the health endpoint with authentication
async function tryWithAuth() {
  try {
    apiStatus.value = 'Checking with auth...'
    
    // Try with Basic Auth first
    const username = prompt('Enter username for Basic Auth:')
    const password = prompt('Enter password for Basic Auth:')
    
    if (!username || !password) {
      apiStatus.value = 'Auth cancelled'
      return
    }
    
    const authString = btoa(`${username}:${password}`)
    
    const response = await fetch(healthCheckUrl.value, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`
      }
    })
    
    if (response.ok) {
      apiStatus.value = 'Auth successful!'
      errorMessage.value = 'API works with Basic Auth. Update your API client to include authentication.'
      
      // If successful, try to get the response body
      try {
        const data = await response.json()
        console.log('API health response with auth:', data)
      } catch (e) {
        console.error('Could not parse response:', e)
      }
    } else {
      apiStatus.value = `Auth failed (${response.status})`
      errorMessage.value = `Basic Auth failed with status ${response.status}`
      
      // Try with a token instead
      const token = prompt('Basic Auth failed. Try with a token instead:')
      
      if (!token) {
        return
      }
      
      const tokenResponse = await fetch(healthCheckUrl.value, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (tokenResponse.ok) {
        apiStatus.value = 'Token auth successful!'
        errorMessage.value = 'API works with token auth. Update your API client to include the token.'
        
        // If successful, try to get the response body
        try {
          const data = await tokenResponse.json()
          console.log('API health response with token auth:', data)
        } catch (e) {
          console.error('Could not parse response:', e)
        }
      } else {
        apiStatus.value = `Token auth failed (${tokenResponse.status})`
        errorMessage.value = `Token auth failed with status ${tokenResponse.status}`
      }
    }
  } catch (error) {
    apiStatus.value = 'Auth error'
    errorMessage.value = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error trying auth:', error)
  }
}

// Function to check API availability using the health endpoint
async function checkApiAvailability() {
  const nuxtApp = useNuxtApp()
  
  if (nuxtApp.$api) {
    try {
      apiStatus.value = 'Checking...'
      errorMessage.value = ''
      
      const available = await nuxtApp.$api.checkAvailability()
      usingMockData.value = nuxtApp.$api.isUsingMockData()
      
      // Check if we got a 500 error (with type safety)
      if (!available && 'lastStatusCode' in nuxtApp.$api && nuxtApp.$api.lastStatusCode === 500) {
        apiStatus.value = '500 Error'
      } else if (!available && errorMessage.value.includes('Failed to fetch')) {
        apiStatus.value = 'Failed to fetch'
      } else {
        apiStatus.value = available ? 'Healthy' : 'Unhealthy'
      }
      
      if (available) {
        console.log('API connection successful!')
      }
    } catch (error) {
      usingMockData.value = true
      
      if (error instanceof Error && error.message.includes('fetch')) {
        apiStatus.value = 'Failed to fetch'
      } else {
        apiStatus.value = 'Error'
      }
      
      errorMessage.value = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error checking API status:', error)
    }
  } else {
    usingMockData.value = true
    apiStatus.value = 'Client Unavailable'
    errorMessage.value = 'API client not available'
  }
}

// Function to check the Rails /up endpoint as a fallback
async function checkUpEndpoint() {
  try {
    const response = await fetch(`${baseUrl.value}/up`)
    
    if (response.ok) {
      apiStatus.value = 'Rails Up (API may still be unavailable)'
    } else {
      apiStatus.value = `Rails Down (${response.status})`
    }
  } catch (error) {
    apiStatus.value = 'Rails Unreachable'
    console.error('Error checking Rails /up endpoint:', error)
  }
}

// Function to retry the API connection
async function retryConnection() {
  retryCount.value++
  apiStatus.value = 'Checking...'
  console.log(`Retrying API connection (attempt ${retryCount.value})...`)
  await checkApiAvailability()
  
  if (!usingMockData.value) {
    // If connection is successful, reload the page to use real data
    window.location.reload()
  }
}

// Function to check if the server is running at all
async function checkServerStatus() {
  try {
    serverStatus.value = 'Checking...'
    
    // Try to reach the server root
    const response = await fetch(baseUrl.value, {
      method: 'HEAD',
      mode: 'no-cors' // This allows us to at least detect if the server is responding
    })
    
    // With no-cors, we can't access the response status, but if we get here, the server responded
    serverStatus.value = 'Server is reachable'
    apiStatus.value = 'Server reachable, but API unavailable'
    
    // Now try the /up endpoint
    try {
      const upResponse = await fetch(`${baseUrl.value}/up`)
      if (upResponse.ok) {
        serverStatus.value = 'Rails app is running (/up endpoint works)'
        apiStatus.value = 'Rails running, API unavailable'
      }
    } catch (e) {
      // Ignore errors from the /up endpoint
    }
  } catch (error) {
    serverStatus.value = 'Server is completely unreachable'
    apiStatus.value = 'Server unreachable'
    errorMessage.value = 'Cannot connect to the server at all. Please check if it is running.'
  }
}

// Check API availability on mount
onMounted(async () => {
  await checkApiAvailability()
  
  // Also check if the API client already knows the availability status
  const nuxtApp = useNuxtApp()
  if (nuxtApp.$api && typeof nuxtApp.$api.isAvailable === 'function') {
    usingMockData.value = !nuxtApp.$api.isAvailable()
  }
})
</script>
