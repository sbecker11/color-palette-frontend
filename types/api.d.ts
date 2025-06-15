// Define the API client interface
export interface ApiClient {
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
  post<T>(endpoint: string, data: any): Promise<T>;
  put<T>(endpoint: string, data: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
  checkAvailability(): Promise<boolean>;
  isAvailable(): boolean;
  isUsingMockData(): boolean;
  readonly lastStatusCode: number;
}

// Define the API response types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
}
