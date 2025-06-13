export interface Image {
  id: string
  name: string
  url?: string
  file_path?: string
  width?: number
  height?: number
  content_type?: string
  file_size?: number
  description?: string
  created_at: string
  updated_at: string
  image_dimensions?: string
  file_size_human?: string
  has_image: boolean
  palette_count: number
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
