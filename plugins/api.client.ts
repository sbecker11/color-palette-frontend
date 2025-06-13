import type { ApiError, ApiRequestOptions } from '~/types/api'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const api = async <T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
    const {
      method = 'GET',
      body,
      headers = {},
      params,
      onUploadProgress
    } = options

    // Build URL with params
    let url = `${baseURL}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value.toString())
      })
      url += `?${searchParams.toString()}`
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      }
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Remove Content-Type header for FormData (browser will set it with boundary)
        delete requestOptions.headers!['Content-Type']
        requestOptions.body = body
      } else {
        requestOptions.body = JSON.stringify(body)
      }
    }

    try {
      const response = await fetch(url, requestOptions)

      // Handle non-JSON responses (like file downloads)
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        if (response.ok) {
          return response as unknown as T
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      }

      const data = await response.json()

      if (!response.ok) {
        const error: ApiError = {
          error: data.error || 'Request failed',
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          details: data.details,
          status: response.status
        }
        throw error
      }

      return data as T
    } catch (error) {
      // Re-throw API errors as-is
      if (error && typeof error === 'object' && 'error' in error) {
        throw error
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw {
          error: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          status: 0
        } as ApiError
      }

      // Handle other errors
      throw {
        error: 'Unknown Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 0
      } as ApiError
    }
  }

  // File upload helper
  const uploadFile = async (
    endpoint: string,
    file: File,
    additionalData: Record<string, any> = {},
    onProgress?: (progress: number) => void
  ) => {
    const formData = new FormData()
    formData.append('file', file)
    
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value)
    })

    return api(endpoint, {
      method: 'POST',
      body: formData,
      onUploadProgress: onProgress ? (progress) => onProgress(progress.percentage) : undefined
    })
  }

  // Download helper
  const downloadFile = async (endpoint: string, filename?: string) => {
    try {
      const response = await api<Response>(endpoint)
      
      if (response instanceof Response) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename || 'download'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Download failed:', error)
      throw error
    }
  }

  return {
    provide: {
      api,
      uploadFile,
      downloadFile
    }
  }
})
