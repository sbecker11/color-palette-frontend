export interface Image {
  id: string
  name: string
  url: string
  thumbnailUrl?: string  // Make thumbnailUrl optional
  createdAt: string
  updatedAt: string
  width: number
  height: number
  fileSize: number
  fileType: string
  colors?: Array<{hex: string; rgb: string; name: string}>
}

export interface ImageApiResponse {
  id: string;
  name: string;
  url: string;
  thumbnail_url?: string;
  thumbnailUrl?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  width?: number;
  height?: number;
  file_size?: number;
  fileSize?: number;
  content_type?: string;
  file_type?: string;
  fileType?: string;
  colors?: Array<{hex: string; rgb: string; name: string}>;
}

export interface ImageUploadResponse {
  id: string
  name: string
  url: string
  thumbnailUrl?: string
  createdAt: string
}

export interface ImageListResponse {
  images: Image[]
  total: number
  page: number
  limit: number
}

export interface ImageCreatePayload {
  name: string
  url?: string
  file_path?: string
  description?: string
}

export interface ImageUpdatePayload {
  name?: string
  url?: string
  file_path?: string
  description?: string
}

export interface ImageUploadPayload {
  name: string
  file?: File
  url?: string
  description?: string
}

export interface ColorAnalysisResult {
  hex: string
  rgb: [number, number, number]
  hsv: [number, number, number]
  pixel_count: number
}

export interface PixelSampleResult {
  hex: string
  rgb: [number, number, number]
  hsv: [number, number, number]
  coordinates: {
    x: number
    y: number
  }
}
