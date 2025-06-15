import { defineStore } from 'pinia'
import type { Palette } from '~/types/palette'

export const usePalettesStore = defineStore('palettes', {
  state: () => ({
    palettes: [] as Palette[],
    palettesForCurrentImage: [] as Palette[],
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchPalettesByImage(imageId: string) {
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
    }
  }
})
