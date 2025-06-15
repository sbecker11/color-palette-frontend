export interface Image {
  id: string
  name: string
  url: string
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
  width?: number
  height?: number
  fileSize?: number
  fileType?: string
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
