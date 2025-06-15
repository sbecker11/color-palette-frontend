// Define the API client interface
export interface ApiClient {
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
  post<T>(endpoint: string, data?: any): Promise<T>;
  put<T>(endpoint: string, data?: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
  checkAvailability(): Promise<boolean>;
  isAvailable(): boolean;
  isUsingMockData(): boolean;
}

// Define pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Define the API response types
export interface ApiResponse<T = any> {
  data: T;
  meta?: {
    pagination?: {
      total: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    }
  };
}

export interface ErrorResponse {
  error: string;
  status: number;
  message: string;
}
