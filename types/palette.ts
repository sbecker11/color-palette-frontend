export interface Palette {
  id: number | string;
  name: string;
  description: string;
  colors: PaletteColor[] | Record<string, any>; // Handle both array and object formats
  image_id: number | string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaletteColor {
  id?: string;
  hex: string;
  rgb?: string;
  name?: string;
  position?: number;
  percentage?: number;
}

// Add Color type alias for backward compatibility
export type Color = PaletteColor;

// Add a type for the export endpoint
export interface PaletteExport {
  colors: {
    hex: string;
    name: string;
    percentage: number;
  }[];
}
