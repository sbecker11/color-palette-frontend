// composables/useApiHealth.ts
import { ref, computed } from 'vue'
import { usePaletteStore } from '~/stores/palettes'

export interface ApiHealthData {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  database_connection: boolean;
  ruby_version: string;
  rails_version: string;
}

export interface ApiHealthStatus {
  isHealthy: boolean;
  isChecking: boolean;
  lastChecked: string | null;
  data: ApiHealthData | null;
  error: string | null;
}

export function useApiHealth() {
  const config = useRuntimeConfig()
  const apiUrl = computed(() => config.public.apiBase)
  const healthCheckUrl = computed(() => apiUrl.value ? `${apiUrl.value}/health` : null)
  
  const healthStatus = ref<ApiHealthStatus>({
    isHealthy: false,
    isChecking: false,
    lastChecked: null,
    data: null,
    error: null
  })

  const paletteStore = usePaletteStore();
  
  // Set offline mode by default if no API is available
  if (process.client) {
    // If apiBase is null, force offline mode
    if (!apiUrl.value) {
      console.log('No API URL configured, forcing offline mode')
      paletteStore.toggleOfflineMode(true)
    } else {
      // Otherwise check if we've already set offline mode preference
      const savedOfflineMode = localStorage.getItem('offlineMode')
      if (savedOfflineMode === null) {
        // If not set yet, default to offline mode
        paletteStore.toggleOfflineMode(true)
      }
    }
  }

  // Check the API health
  async function checkHealth() {
    // If no API URL is configured, don't even try
    if (!apiUrl.value) {
      console.log('No API URL configured, skipping health check');
      healthStatus.value = {
        isHealthy: false,
        isChecking: false,
        lastChecked: new Date().toISOString(),
        data: null,
        error: 'No API URL configured'
      }
      return healthStatus.value
    }
    
    // If offline mode is enabled, don't try to check API health
    if (paletteStore.offlineMode) {
      console.log('Offline mode enabled, skipping health check');
      healthStatus.value = {
        isHealthy: false,
        isChecking: false,
        lastChecked: new Date().toISOString(),
        data: null,
        error: 'Offline mode enabled'
      }
      return healthStatus.value
    }
    
    healthStatus.value.isChecking = true
    healthStatus.value.error = null
    
    try {
      // Skip the actual fetch if in offline mode (redundant check for safety)
      if (paletteStore.offlineMode) {
        throw new Error('Offline mode enabled')
      }
      
      // Wrap the fetch in a check to prevent it from running in offline mode
      let response;
      if (!paletteStore.offlineMode) {
        response = await fetch(healthCheckUrl.value, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          credentials: 'include' // Include credentials for authentication
        });
      } else {
        throw new Error('Offline mode enabled');
      }
      
      if (!response.ok) {
        // If we get a 401 or 403, it might be an authentication issue
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Authentication required: ${response.status}`)
        }
        throw new Error(`API responded with status: ${response.status}`)
      }
      
      const data = await response.json() as ApiHealthData
      
      healthStatus.value = {
        isHealthy: data.status === 'ok' && data.database_connection === true,
        isChecking: false,
        lastChecked: new Date().toISOString(),
        data,
        error: null
      }
      
      return healthStatus.value
    } catch (error) {
      healthStatus.value = {
        isHealthy: false,
        isChecking: false,
        lastChecked: new Date().toISOString(),
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error checking API health'
      }
      
      return healthStatus.value
    }
  }

  // Check the Rails /up endpoint as a fallback
  async function checkRailsUp() {
    if (paletteStore.offlineMode) {
      return {
        isUp: false,
        status: 0,
        statusText: 'Offline mode enabled'
      }
    }
    try {
      const baseUrl = apiUrl.value.replace(/\/api\/v1$/, '')
      const response = await fetch(`${baseUrl}/up`)
      
      return {
        isUp: response.ok,
        status: response.status,
        statusText: response.statusText
      }
    } catch (error) {
      return {
        isUp: false,
        status: 0,
        statusText: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  return {
    healthStatus,
    healthCheckUrl,
    checkHealth,
    checkRailsUp
  }
}
