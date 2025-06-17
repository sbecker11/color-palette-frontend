export interface Palette {
  id: string;
  paletteName: string;
  colorPalette: (string | PaletteColor)[];
  createdDateTime?: string;
  uploadedURL?: string;
  imageURL?: string;
  image_url?: string;
  uploadedFilePath?: string | null;
  cachedFilePath?: string;
  width?: number;
  height?: number;
  format?: string;
  fileSizeBytes?: number;
  description?: string;
  image?: {
    url?: string;
    width?: number;
    height?: number;
  };
}

export interface PaletteColor {
  id?: string;
  hex: string;
  rgb?: string | number[];
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
