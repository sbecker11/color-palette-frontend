export interface Image {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  // Add file_path if it's in the API
  file_path?: string;
}

// Update the ImageApiResponse interface to match the API response
export interface ImageApiResponse {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  file_path?: string;
}

export interface ImageUploadResponse {
  id: string
  name: string
  url: string
}

export interface ImageListResponse {
  images: Image[]
  total: number
  page: number
  limit: number
}


