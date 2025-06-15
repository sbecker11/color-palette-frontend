import { defineNuxtPlugin } from '#app'
import type { ApiResponse, ErrorResponse } from '~/types/api'
// Import ApiClient as ApiClientType to avoid naming conflict
import type { ApiClient as ApiClientType } from '~/types/api'

// Define the API client interface - renamed to avoid conflict
interface ApiClientImpl {
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
  post<T>(endpoint: string, data: any): Promise<T>;
  put<T>(endpoint: string, data: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
  checkAvailability(): Promise<boolean>;
  isAvailable(): boolean;
  isUsingMockData(): boolean;
  readonly lastStatusCode: number;
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || 'http://localhost:3001/api/v1'
  
  console.log('API Base URL:', baseURL)
  
  // Track API availability status
  const apiAvailable = ref(false)
  
  // Track if we're in development mode
  const isDev = process.env.NODE_ENV === 'development'
  
  // Create a flag to use mock data
  const useMockData = ref(isDev)

  // Track the last status code from the API
  const lastStatusCode = ref(0)

  // Create the API client
  const api: ApiClientImpl = {
    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
      console.log(`API get request for ${endpoint} with params:`, params);
      
      // Only use mock data if we've explicitly set useMockData to true
      // and we're in development mode
      if (useMockData.value && isDev && endpoint.startsWith('/images')) {
        console.log(`Using mock data for GET ${endpoint}`);
        return getMockData<T>(endpoint, params);
      }
      
      const url = new URL(`${baseURL}${endpoint}`)
      
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key].toString())
          }
        })
      }
      
      try {
        const fetchConfig: RequestInit = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          credentials: 'include' as RequestCredentials
        }
        
        console.log(`Fetching from: ${url.toString()}`)
        const response = await fetch(url.toString(), fetchConfig)
        
        if (!response.ok) {
          const error = await response.json() as ErrorResponse
          throw new Error(error.message || 'API request failed')
        }
        
        return await response.json() as T
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error)
        
        // If we're in development, fall back to mock data
        if (isDev) {
          console.log(`Falling back to mock data for ${endpoint}`)
          useMockData.value = true
          return getMockData<T>(endpoint, params)
        }
        
        throw error
      }
    },
    
    async post<T>(endpoint: string, data?: any): Promise<T> {
      // If we're using mock data and in development, simulate a successful post
      if (useMockData.value && isDev && endpoint.startsWith('/images')) {
        console.log(`Using mock data for POST ${endpoint}`)
        return getMockPostResponse<T>(endpoint, data)
      }
      
      const url = `${baseURL}${endpoint}`
      
      try {
        const fetchConfig: RequestInit = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: data ? JSON.stringify(data) : undefined,
          mode: 'cors',
          credentials: 'include' as RequestCredentials
        }
        
        const response = await fetch(url, fetchConfig)
        
        if (!response.ok) {
          const error = await response.json() as ErrorResponse
          throw new Error(error.message || 'API request failed')
        }
        
        return await response.json() as T
      } catch (error) {
        console.error(`Error posting to ${endpoint}:`, error)
        
        // If we're in development, fall back to mock data
        if (isDev) {
          console.log(`Falling back to mock data for POST ${endpoint}`)
          useMockData.value = true
          return getMockPostResponse<T>(endpoint, data)
        }
        
        throw error
      }
    },
    
    async put<T>(endpoint: string, data?: any): Promise<T> {
      // If we're using mock data and in development, simulate a successful put
      if (useMockData.value && isDev) {
        console.log(`Using mock data for PUT ${endpoint}`)
        return getMockPutResponse<T>(endpoint, data)
      }
      
      const url = `${baseURL}${endpoint}`
      
      try {
        const fetchConfig: RequestInit = {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: data ? JSON.stringify(data) : undefined,
          mode: 'cors',
          credentials: 'include' as RequestCredentials
        }
        
        const response = await fetch(url, fetchConfig)
        
        if (!response.ok) {
          const error = await response.json() as ErrorResponse
          throw new Error(error.message || 'API request failed')
        }
        
        return await response.json() as T
      } catch (error) {
        console.error(`Error putting to ${endpoint}:`, error)
        
        // If we're in development, fall back to mock data
        if (isDev) {
          console.log(`Falling back to mock data for PUT ${endpoint}`)
          useMockData.value = true
          return getMockPutResponse<T>(endpoint, data)
        }
        
        throw error
      }
    },
    
    async delete<T>(endpoint: string): Promise<T> {
      // If we're using mock data and in development, simulate a successful delete
      if (useMockData.value && isDev) {
        console.log(`Using mock data for DELETE ${endpoint}`)
        return {} as T
      }
      
      const url = `${baseURL}${endpoint}`
      
      try {
        const fetchConfig: RequestInit = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          credentials: 'include' as RequestCredentials
        }
        
        const response = await fetch(url, fetchConfig)
        
        if (!response.ok) {
          const error = await response.json() as ErrorResponse
          throw new Error(error.message || 'API request failed')
        }
        
        return await response.json() as T
      } catch (error) {
        console.error(`Error deleting ${endpoint}:`, error)
        
        // If we're in development, fall back to mock data
        if (isDev) {
          console.log(`Falling back to mock data for DELETE ${endpoint}`)
          useMockData.value = true
          return {} as T
        }
        
        throw error
      }
    },
    
    async checkAvailability(): Promise<boolean> {
      try {
        console.log(`Checking API availability at: ${baseURL}/health`)
        
        const url = `${baseURL}/health`
        
        // Create an AbortController to implement a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        try {
          // First check if the server is reachable at all
          try {
            // Simple HEAD request to check if server is up
            const pingResponse = await fetch(baseURL.replace(/\/api\/v1$/, '/'), {
              method: 'HEAD',
              mode: 'no-cors' // This allows us to detect if the server is responding
            });
            
            console.log('Server is reachable');
          } catch (pingError) {
            console.error('Server appears to be down or unreachable:', pingError);
            apiAvailable.value = false;
            if (isDev) {
              useMockData.value = true;
            }
            throw new Error('API server is unreachable');
          }
          
          // Try the Rails /up endpoint as a fallback first
          try {
            console.log('Trying Rails /up endpoint...');
            const railsUpUrl = baseURL.replace(/\/api\/v1$/, '/up');
            const railsResponse = await fetch(railsUpUrl, { 
              signal: controller.signal,
              mode: 'cors' // Explicitly set CORS mode
            });
            
            console.log(`Rails /up endpoint status: ${railsResponse.status}`);
            
            if (railsResponse.ok) {
              console.log('Rails application is running');
            } else {
              console.log(`Rails application returned status: ${railsResponse.status}`);
            }
          } catch (upError) {
            console.log('Rails /up endpoint not available:', upError);
          }
          
          // Now try the actual health endpoint
          const fetchConfig: RequestInit = {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            credentials: 'include', // Include credentials for authentication
            mode: 'cors',
            signal: controller.signal
          };
          
          const response = await fetch(url, fetchConfig);
          clearTimeout(timeoutId);
          
          console.log('API response status:', response.status);
          lastStatusCode.value = response.status;
          
          if (!response.ok) {
            console.log(`API error details: ${response.statusText}`);
            throw new Error(`API returned error ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data && data.status === 'ok') {
            console.log('API is healthy:', data);
            apiAvailable.value = true;
            useMockData.value = false; // Reset mock data flag when API is available
            return true;
          } else {
            console.log('API returned unexpected data:', data);
            throw new Error('API returned unexpected data');
          }
        } catch (error) {
          clearTimeout(timeoutId);
          
          if (error instanceof DOMException && error.name === 'AbortError') {
            console.log('API request timed out');
          } else {
            console.error('Error checking API availability:', error);
          }
          
          apiAvailable.value = false;
          if (isDev) {
            useMockData.value = true;
          }
          return false;
        }
      } catch (error) {
        console.error('Unexpected error in checkAvailability:', error);
        apiAvailable.value = false;
        if (isDev) {
          useMockData.value = true;
        }
        return false;
      }
    },
    
    isAvailable(): boolean {
      return apiAvailable.value
    },
    
    isUsingMockData(): boolean {
      return useMockData.value
    },
    
    get lastStatusCode(): number {
      return lastStatusCode.value
    }
  }

  // Helper function to generate mock data
  function getMockData<T>(endpoint: string, params?: Record<string, any>): T {
    if (endpoint === '/images') {
      // Generate mock image list
      const page = params?.page || 1
      const limit = params?.limit || 12
      const total = 50 // Mock total count
      
      const mockImages = Array.from({ length: limit }, (_, i) => {
        const id = `mock-${(page - 1) * limit + i + 1}`
        return {
          id,
          name: `Mock Image ${id}`,
          url: `https://picsum.photos/seed/${id}/800/600`,
          thumbnailUrl: `https://picsum.photos/seed/${id}/400/300`,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
          width: 800,
          height: 600,
          fileSize: 2048 * 1024,
          fileType: 'image/jpeg',
          colors: [
            { hex: '#FF5733', rgb: 'rgb(255, 87, 51)', name: 'Coral Red' },
            { hex: '#33FF57', rgb: 'rgb(51, 255, 87)', name: 'Lime Green' },
            { hex: '#3357FF', rgb: 'rgb(51, 87, 255)', name: 'Royal Blue' },
            { hex: '#F3FF33', rgb: 'rgb(243, 255, 51)', name: 'Bright Yellow' },
            { hex: '#33FFF3', rgb: 'rgb(51, 255, 243)', name: 'Aqua' }
          ]
        }
      })
      
      return {
        images: mockImages,
        total,
        page,
        limit
      } as unknown as T
    } else if (endpoint.startsWith('/images/')) {
      // Generate mock single image
      const id = endpoint.split('/').pop() || 'unknown'
      
      return {
        id,
        name: `Mock Image ${id}`,
        url: `https://picsum.photos/seed/${id}/800/600`,
        thumbnailUrl: `https://picsum.photos/seed/${id}/400/300`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        width: 800,
        height: 600,
        fileSize: 2048 * 1024,
        fileType: 'image/jpeg',
        colors: [
          { hex: '#FF5733', rgb: 'rgb(255, 87, 51)', name: 'Coral Red' },
          { hex: '#33FF57', rgb: 'rgb(51, 255, 87)', name: 'Lime Green' },
          { hex: '#3357FF', rgb: 'rgb(51, 87, 255)', name: 'Royal Blue' },
          { hex: '#F3FF33', rgb: 'rgb(243, 255, 51)', name: 'Bright Yellow' },
          { hex: '#33FFF3', rgb: 'rgb(51, 255, 243)', name: 'Aqua' }
        ]
      } as unknown as T
    }
    
    // Default fallback
    return {} as T
  }
  
  // Helper function to generate mock POST responses
  function getMockPostResponse<T>(endpoint: string, data?: any): T {
    if (endpoint === '/images') {
      // Mock image upload response
      const id = `mock-${Date.now()}`
      
      return {
        id,
        name: data?.name || `Uploaded Image ${id}`,
        url: data?.url || `https://picsum.photos/seed/${id}/800/600`,
        thumbnailUrl: `https://picsum.photos/seed/${id}/400/300`,
        createdAt: new Date().toISOString(),
        colors: [
          { hex: '#FF5733', rgb: 'rgb(255, 87, 51)', name: 'Coral Red' },
          { hex: '#33FF57', rgb: 'rgb(51, 255, 87)', name: 'Lime Green' },
          { hex: '#3357FF', rgb: 'rgb(51, 87, 255)', name: 'Royal Blue' }
        ]
      } as unknown as T
    }
    
    // Default fallback
    return {
      id: `mock-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString()
    } as unknown as T
  }
  
  // Helper function to generate mock PUT responses
  function getMockPutResponse<T>(endpoint: string, data?: any): T {
    // For PUT requests, we typically just return the updated data
    return {
      ...data,
      updatedAt: new Date().toISOString()
    } as unknown as T
  }

  // Register the API client
  nuxtApp.provide('api', api)

  // Check API availability on app start
  if (process.client) {
    // Immediate check with a short timeout to avoid blocking the UI
    setTimeout(async () => {
      console.log('Initial API availability check...')
      const available = await api.checkAvailability()
      
      if (available) {
        console.log('API is available, resetting mock data flag')
        useMockData.value = false
        
        // If we're on the images page, refresh the data
        const route = useRoute()
        if (route.path === '/' || route.path.startsWith('/images')) {
          console.log('On images page, refreshing data with real API')
          const imagesStore = useImagesStore()
          imagesStore.fetchImages()
        }
      }
    }, 100)
  }
})
