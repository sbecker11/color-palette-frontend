export interface Color {
  id: string;
  hex: string;
  rgb: string;
  name: string;
  position: number;
}

export interface Palette {
  id: string;
  name: string;
  imageId: string;
  imageUrl?: string;
  colors: Color[];
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface CreatePaletteParams {
  name: string;
  imageId: string;
  useKMeans?: boolean;
  colorsCount?: number;
  colors?: Color[];
  description?: string;
}
