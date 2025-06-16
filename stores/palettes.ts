import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { Palette } from '~/types/palette'

// Define a more specific type for the local storage
type PaletteRecord = Record<string, Palette>

// Create a local storage for palettes with a namespace and proper typing
const localPalettes = useLocalStorage<PaletteRecord>('color-palette-app-palettes', {})
const localPendingChanges = useLocalStorage<string[]>('color-palette-app-pending-changes', [])

export const usePaletteStore = defineStore('palette', {
  state: () => ({
    palettes: [] as Palette[],
    currentPalette: null as Palette | null,
    loading: false,
    error: null as string | null,
    offlineMode: false,
    // Add localPendingChanges to the state so it's accessible via $state
    localPendingChanges: localPendingChanges,
    // Track if there are unsaved changes in the current session
    unsavedChanges: {} as Record<string, boolean>,
    // Add a property to store palettes for the current image
    palettesForCurrentImage: [] as Palette[]
  }),
  
  getters: {
    hasPendingChanges: (state) => localPendingChanges.value.length > 0,
    
    // Check if the current palette has unsaved changes
    hasUnsavedChanges: (state) => {
      if (!state.currentPalette) return false
      return !!state.unsavedChanges[state.currentPalette.id]
    },
    
    // Get all palette IDs with unsaved changes
    palettesWithUnsavedChanges: (state) => {
      return Object.keys(state.unsavedChanges).filter(id => state.unsavedChanges[id])
    }
  },
  
  actions: {
    // Toggle offline mode
    toggleOfflineMode(value: boolean) {
      this.offlineMode = value
      console.log(`Offline mode ${value ? 'enabled' : 'disabled'}`)
    },
    
    // Mark a palette as having unsaved changes
    markUnsaved(id: string) {
      this.unsavedChanges[id] = true
    },
    
    // Mark a palette as saved
    markSaved(id: string) {
      this.unsavedChanges[id] = false
    },
    
    // Fetch a single palette by ID
    async getPalette(id: string) {
      this.loading = true
      this.error = null
      
      try {
        // If in offline mode or we have pending changes, use local data
        if (this.offlineMode || localPendingChanges.value.includes(id)) {
          console.log(`Using local data for palette ${id}`)
          if (localPalettes.value[id]) {
            this.currentPalette = localPalettes.value[id]
            this.loading = false
            return this.currentPalette
          }
        }
        
        const response = await fetch(`/api/palettes/${id}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch palette: ${response.status}`)
        }
        
        const data = await response.json()
        this.currentPalette = data
        
        // Update local storage
        localPalettes.value[id] = data
        
        return this.currentPalette
      } catch (error) {
        console.error(`Error fetching palette ${id}:`, error)
        this.error = 'Failed to fetch palette. Using locally cached data if available.'
        
        // Fall back to local data
        if (localPalettes.value[id]) {
          this.currentPalette = localPalettes.value[id]
          return this.currentPalette
        }
        
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // Fetch palettes for a specific image
    async fetchPalettesByImage(imageId: string) {
      this.loading = true
      this.error = null
      
      try {
        // If in offline mode, use local data
        if (this.offlineMode) {
          console.log(`Using local data for palettes of image ${imageId}`)
          
          // Create a properly typed array from the local storage object
          const localPalettesArray: Palette[] = [];
          
          // Iterate through the object and filter manually
          Object.keys(localPalettes.value).forEach(key => {
            const palette = localPalettes.value[key];
            if (palette && palette.image_id === imageId) {
              localPalettesArray.push(palette);
            }
          });
          
          this.palettesForCurrentImage = localPalettesArray;
          this.loading = false;
          return this.palettesForCurrentImage;
        }
        
        const response = await fetch(`/api/images/${imageId}/palettes`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch palettes for image: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Transform data if needed to ensure consistent property names
        const transformedPalettes: Palette[] = Array.isArray(data) 
          ? data.map((item: any) => this.transformPaletteData(item)) 
          : []
        
        this.palettesForCurrentImage = transformedPalettes
        
        // Update local storage
        transformedPalettes.forEach((palette: Palette) => {
          localPalettes.value[palette.id] = palette
        })
        
        return this.palettesForCurrentImage
      } catch (error) {
        console.error(`Error fetching palettes for image ${imageId}:`, error)
        this.error = 'Failed to fetch palettes. Using locally cached data if available.'
        
        // Fall back to local data with proper typing
        const localPalettesArray: Palette[] = [];
          
        // Iterate through the object and filter manually
        Object.keys(localPalettes.value).forEach(key => {
          const palette = localPalettes.value[key];
          if (palette && palette.image_id === imageId) {
            localPalettesArray.push(palette);
          }
        });
        
        this.palettesForCurrentImage = localPalettesArray;
        return this.palettesForCurrentImage;
      } finally {
        this.loading = false
      }
    },
    
    // Transform API response to match your Palette type
    transformPaletteData(palette: any): Palette {
      // Ensure we have valid data to work with
      if (!palette || typeof palette !== 'object') {
        console.error('Invalid palette data received:', palette)
        throw new Error('Invalid palette data')
      }

      // Handle RGB format conversion
      const processRgb = (rgb: any): string => {
        if (typeof rgb === 'string') return rgb
        if (Array.isArray(rgb)) return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
        return 'rgb(0, 0, 0)' // Default fallback
      }

      // Process colors with proper error handling
      const processColors = () => {
        if (!Array.isArray(palette.colors)) return []
        
        return palette.colors.map((color: any) => {
          if (!color || typeof color !== 'object') return {
            id: `temp-${Math.random().toString(36).substring(2, 9)}`,
            hex: '#000000',
            rgb: 'rgb(0, 0, 0)',
            name: '',
            position: 0
          }
          
          return {
            id: color.id || `temp-${Math.random().toString(36).substring(2, 9)}`,
            hex: color.hex || '#000000',
            rgb: processRgb(color.rgb),
            name: color.name || '',
            position: typeof color.position === 'number' ? color.position : 0
          }
        })
      }

      // Create a properly formatted palette object
      return {
        id: (palette.id || '').toString(),
        name: palette.name || 'Unnamed Palette',
        image_id: (palette.image_id || '').toString(),
        imageUrl: palette.image_url || palette.imageUrl || '',
        colors: processColors(),
        createdAt: palette.created_at || palette.createdAt || new Date().toISOString(),
        updatedAt: palette.updated_at || palette.updatedAt || new Date().toISOString(),
        description: palette.description || ''
      }
    },
    
    // Update a palette
    async updatePalette(id: string, paletteData: Partial<Palette>) {
      this.loading = true
      this.error = null
      
      try {
        // Create the updated palette by merging with existing data
        // Use type assertion to ensure TypeScript knows all required fields are present
        const updatedPalette = {
          ...(this.currentPalette || {}),
          ...paletteData,
          id
        } as Palette;
        
        // Mark as having unsaved changes
        this.markUnsaved(id)
        
        // Always update local storage immediately
        localPalettes.value[id] = updatedPalette
        
        // If offline, mark as pending and don't try to sync
        if (this.offlineMode) {
          if (!localPendingChanges.value.includes(id)) {
            localPendingChanges.value.push(id)
          }
          this.currentPalette = updatedPalette
          console.log(`Palette ${id} updated locally (offline mode)`)
          return
        }
        
        // Try to sync with backend
        const response = await fetch(`/api/palettes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedPalette)
        })
        
        if (!response.ok) {
          throw new Error(`Failed to update palette: ${response.status}`)
        }
        
        const data = await response.json()
        this.currentPalette = data
        
        // Update local storage with response data
        localPalettes.value[id] = data
        
        // Update the palette in the palettes array if it exists there
        const index = this.palettes.findIndex(p => p.id === id)
        if (index !== -1) {
          this.palettes[index] = data
        }
        
        // Also update in palettesForCurrentImage if it exists there
        const imageIndex = this.palettesForCurrentImage.findIndex(p => p.id === id)
        if (imageIndex !== -1) {
          this.palettesForCurrentImage[imageIndex] = data
        }
        
        // Mark as saved
        this.markSaved(id)
      } catch (error) {
        console.error(`Error updating palette ${id}:`, error)
        this.error = 'Failed to sync with server. Changes saved locally.'
        
        // Mark as pending for later sync
        if (!localPendingChanges.value.includes(id)) {
          localPendingChanges.value.push(id)
        }
      } finally {
        this.loading = false
      }
    },
    
    // Sync pending changes with the backend
    async syncPendingChanges() {
      if (this.offlineMode || localPendingChanges.value.length === 0) {
        return
      }
      
      this.loading = true
      const pendingIds = [...localPendingChanges.value]
      
      for (const id of pendingIds) {
        try {
          console.log(`Syncing palette ${id} with backend`)
          const palette = localPalettes.value[id]
          
          if (!palette) {
            console.warn(`No local data found for palette ${id}`)
            continue
          }
          
          const response = await fetch(`/api/palettes/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(palette)
          })
          
          if (!response.ok) {
            throw new Error(`Failed to sync palette ${id}: ${response.status}`)
          }
          
          const data = await response.json()
          
          // Update local storage with response
          localPalettes.value[id] = data
          
          // Remove from pending changes
          localPendingChanges.value = localPendingChanges.value.filter(
            pendingId => pendingId !== id
          )
          
          // Mark as saved
          this.markSaved(id)
          
          console.log(`Successfully synced palette ${id}`)
        } catch (error) {
          console.error(`Error syncing palette ${id}:`, error)
        }
      }
      
      this.loading = false
    },
    
    // Clear all local data (for testing/debugging)
    clearLocalData() {
      localPalettes.value = {}
      localPendingChanges.value = []
      this.unsavedChanges = {}
      console.log('Local palette data cleared')
    },
    
    // Fetch all palettes
    async fetchPalettes() {
      this.loading = true
      this.error = null
      
      try {
        // If in offline mode, use local data
        if (this.offlineMode) {
          console.log('Using local data for palettes')
          
          // Create a properly typed array from the local storage object
          const localPalettesArray: Palette[] = Object.values(localPalettes.value)
          
          this.palettes = localPalettesArray
          this.loading = false
          return this.palettes
        }
        
        const response = await fetch('/api/palettes')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch palettes: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Transform data if needed to ensure consistent property names
        const transformedPalettes: Palette[] = Array.isArray(data) 
          ? data.map((item: any) => this.transformPaletteData(item)) 
          : []
        
        this.palettes = transformedPalettes
        
        // Update local storage
        transformedPalettes.forEach((palette: Palette) => {
          localPalettes.value[palette.id] = palette
        })
        
        return this.palettes
      } catch (error) {
        console.error('Error fetching palettes:', error)
        this.error = 'Failed to fetch palettes. Using locally cached data if available.'
        
        // Fall back to local data
        const localPalettesArray: Palette[] = Object.values(localPalettes.value)
        this.palettes = localPalettesArray
        return this.palettes
      } finally {
        this.loading = false
      }
    }
  }
})

// Add this alias for backward compatibility
export const usePalettesStore = usePaletteStore
