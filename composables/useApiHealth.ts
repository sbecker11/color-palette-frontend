// composables/useApiHealth.ts
import { ref, computed } from 'vue'

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
  const apiUrl = computed(() => config.public.apiBase || 'http://localhost:3001/api/v1')
  const healthCheckUrl = computed(() => `${apiUrl.value}/health`)
  
  const healthStatus = ref<ApiHealthStatus>({
    isHealthy: false,
    isChecking: false,
    lastChecked: null,
    data: null,
    error: null
  })

  // Check the API health
  async function checkHealth() {
    healthStatus.value.isChecking = true
    healthStatus.value.error = null
    
    try {
      const response = await fetch(healthCheckUrl.value, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include' // Include credentials for authentication
      })
      
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
