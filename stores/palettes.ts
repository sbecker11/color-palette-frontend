import { defineStore } from 'pinia'
import type { Palette } from '~/types/palette'

export const usePalettesStore = defineStore('palettes', {
  state: () => ({
    palettes: [] as Palette[],
    palettesForCurrentImage: [] as Palette[],
    currentPalette: null as Palette | null,
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchPalettesByImage(imageId: string): Promise<Palette[]> {
      this.loading = true
      this.error = null
      
      try {
        // Fetch from API
        const response = await fetch(`/api/images/${imageId}/palettes`)
        if (!response.ok) {
          throw new Error(`Failed to fetch palettes: ${response.status}`)
        }
        
        const data = await response.json()
        this.palettesForCurrentImage = data
        return this.palettesForCurrentImage
      } catch (err: any) {
        this.error = err.message || 'Failed to load palettes'
        console.error('Error fetching palettes:', err)
        this.palettesForCurrentImage = []
        throw err
      } finally {
        this.loading = false
      }
    },
    
    async getPalette(id: string): Promise<Palette | null> {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Store: Fetching palette with ID:', id);
        
        // Check if we already have this palette in our state
        const existingPalette = this.palettes.find(p => p.id === id) || 
                               this.palettesForCurrentImage.find(p => p.id === id);
        
        if (existingPalette) {
          console.log('Store: Found existing palette:', existingPalette);
          this.currentPalette = existingPalette;
          return this.currentPalette;
        }
        
        // Fetch from API if not found in state
        console.log('Store: Fetching from API');
        const response = await fetch(`/api/palettes/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch palette: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Store: Raw API response:', data);
        
        // Transform the data if needed (snake_case to camelCase)
        const palette: Palette = {
          id: data.id,
          name: data.name,
          imageId: data.image_id || data.imageId,
          imageUrl: data.image_url || data.imageUrl || '',
          colors: data.colors.map((color: any) => ({
            id: color.id,
            hex: color.hex,
            rgb: color.rgb,
            name: color.name || '',
            position: color.position || 0
          })),
          createdAt: data.created_at || data.createdAt,
          updatedAt: data.updated_at || data.updatedAt,
          description: data.description || ''
        };
        
        console.log('Store: Transformed palette:', palette);
        console.log('Store: Image URL:', palette.imageUrl);
        
        this.currentPalette = palette;
        return this.currentPalette;
      } catch (err: any) {
        console.error('Store: Error fetching palette:', err);
        this.error = err.message || 'Failed to load palette';
        this.currentPalette = null;
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
})
