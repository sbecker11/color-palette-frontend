export interface ColorData {
  id: string
  hex: string
  rgb: [number, number, number]
  hsv: [number, number, number]
  position: number
}

export interface Palette {
  id: string
  name: string
  description?: string
  colors: ColorData[]
  created_at: string
  updated_at: string
  color_count: number
  hex_colors: string[]
  image_id: string
  image_name: string
}

export interface PaletteCreatePayload {
  name: string
  description?: string
  colors: ColorData[]
}

export interface PaletteUpdatePayload {
  name?: string
  description?: string
  colors?: ColorData[]
}

export interface PaletteExportData {
  name: string
  description?: string
  colors: {
    hex: string
    rgb: [number, number, number]
    hsv: [number, number, number]
  }[]
  metadata: {
    source_image: string
    created_at: string
    color_count: number
  }
}

export interface ColorEditData {
  hex?: string
  rgb?: [number, number, number]
  hsv?: [number, number, number]
}

export interface ColorPickerResult {
  hex: string
  rgb: [number, number, number]
  hsv: [number, number, number]
}
