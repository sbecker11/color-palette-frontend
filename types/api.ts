export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  details?: string[]
}

export interface PaginatedResponse<T> {
  [key: string]: T[] | PaginationMeta
  meta: PaginationMeta
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total_pages: number
  total_count: number
}

export interface ApiError {
  error: string
  message: string
  details?: string[]
  status?: number
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  params?: Record<string, string | number>
  onUploadProgress?: (progress: UploadProgress) => void
}
