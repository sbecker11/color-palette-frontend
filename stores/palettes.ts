import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { Palette } from '~/types/palette'
import type { Ref } from 'vue'

// Define a more specific type for the local storage
type PaletteRecord = Record<string, Palette>

// Create a local storage for palettes with a namespace and proper typing
const localPalettes = useLocalStorage<PaletteRecord>('color-palette-app-palettes', {})
const localPendingChanges = useLocalStorage<string[]>('color-palette-app-pending-changes', [])

function getOfflineMode(store: any): boolean {
  // Handles both Ref and boolean for SSR/client hydration edge cases
  const val = store.offlineMode
  if (typeof val === 'object' && val !== null && 'value' in val) return val.value
  return Boolean(val)
}

function setOfflineMode(store: any, value: boolean) {
  const val = store.offlineMode
  if (typeof val === 'object' && val !== null && 'value' in val) val.value = value
  else store.offlineMode = value
}

export const usePaletteStore = defineStore('palette', {
  state: () => {
    const offlineMode = useLocalStorage<boolean>('color-palette-app-offline-mode', false)
    return {
      palettes: [] as Palette[],
      currentPalette: null as Palette | null,
      loading: false,
      error: null as string | null,
      offlineMode: offlineMode,
      // Add localPendingChanges to the state so it's accessible via $state
      localPendingChanges: localPendingChanges,
      // Track if there are unsaved changes in the current session
      unsavedChanges: {} as Record<string, boolean>,
      // Add a property to store palettes for the current image
      palettesForCurrentImage: [] as Palette[]
    }
  },
  
  getters: {
    hasPendingChanges: (state) => localPendingChanges.value.length > 0,
    offlineModeValue: (state) => getOfflineMode(state),
    
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
      setOfflineMode(this, value)
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
        console.log('Fetching palette with ID:', id)
        console.log('Available palettes in local storage:', Object.keys(localPalettes.value))
        
        // Always use local data
        if (localPalettes.value[id]) {
          console.log('Found palette in local storage:', id)
          this.currentPalette = localPalettes.value[id]
          this.loading = false
          return this.currentPalette
        } else {
          // Try to fetch from API if not in offline mode
          if (!this.offlineMode) {
            console.log('Palette not found in local storage, trying API')
            try {
              const response = await fetch(`/api/palettes/${id}`)
              if (response.ok) {
                const data = await response.json()
                console.log('Palette fetched from API:', data)
                
                // Store in local storage for future use
                localPalettes.value[id] = data
                this.currentPalette = data
                this.loading = false
                return this.currentPalette
              }
            } catch (apiError) {
              console.error('API fetch error:', apiError)
            }
          }
          
          console.log('Palette not found:', id)
          this.currentPalette = null
          this.loading = false
          return null
        }
      } catch (error) {
        console.error(`Error fetching palette ${id}:`, error)
        this.error = 'Failed to fetch palette from local storage.'
        this.currentPalette = null
        return null
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
        if (getOfflineMode(this)) {
          console.log(`Using local data for palettes of image ${imageId}`)
          
          // Create a properly typed array from the local storage object
          const localPalettesArray: Palette[] = [];
          
          // Iterate through the object and push all palettes (no image_id check)
          Object.keys(localPalettes.value).forEach(key => {
            const palette = localPalettes.value[key];
            if (palette) {
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
        // Iterate through the object and push all palettes (no image_id check)
        Object.keys(localPalettes.value).forEach(key => {
          const palette = localPalettes.value[key];
          if (palette) {
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
      if (!palette || typeof palette !== 'object') {
        console.error('Invalid palette data received:', palette)
        throw new Error('Invalid palette data')
      }
      // Process colorPalette
      const processColorPalette = () => {
        if (Array.isArray(palette.colorPalette)) return palette.colorPalette
        if (Array.isArray(palette.colors)) return palette.colors
        return []
      }
      return {
        id: (palette.id || '').toString(),
        paletteName: palette.paletteName || palette.name || 'Untitled Palette',
        colorPalette: processColorPalette(),
        createdDateTime: palette.createdDateTime || palette.created_at || palette.createdAt || new Date().toISOString(),
        uploadedURL: palette.uploadedURL || '',
        uploadedFilePath: palette.uploadedFilePath || null,
        cachedFilePath: palette.cachedFilePath || '',
        width: palette.width || 0,
        height: palette.height || 0,
        format: palette.format || '',
        fileSizeBytes: palette.fileSizeBytes || 0,
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
        if (getOfflineMode(this)) {
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
      if (getOfflineMode(this) || localPendingChanges.value.length === 0) {
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
        if (getOfflineMode(this)) {
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
    },
    
    // Import palettes from JSONL data
    async importPalettesFromJsonl(jsonlData: any[]) {
      if (!Array.isArray(jsonlData) || jsonlData.length === 0) {
        console.warn('No valid JSONL data to import')
        return []
      }
      
      console.log(`Importing ${jsonlData.length} palettes from JSONL data`)
      
      // Transform JSONL data to palette format
      const importedPalettes: Palette[] = jsonlData.map((item, index) => {
        // Generate a stable ID based on index or use existing ID
        const id = item.id || `jsonl-${index}-${Date.now()}`
        
        return {
          id: id,
          paletteName: item.paletteName || item.name || 'Untitled Palette',
          colorPalette: Array.isArray(item.colorPalette) ? item.colorPalette : 
                        Array.isArray(item.colors) ? item.colors : [],
          createdDateTime: item.createdDateTime || item.created_at || new Date().toISOString(),
          uploadedURL: item.uploadedURL || item.imageURL || item.image_url || '',
          uploadedFilePath: item.uploadedFilePath || null,
          cachedFilePath: item.cachedFilePath || '',
          width: item.width || 0,
          height: item.height || 0,
          format: item.format || '',
          fileSizeBytes: item.fileSizeBytes || 0,
          description: item.description || ''
        }
      })
      
      // Store in local storage
      importedPalettes.forEach(palette => {
        localPalettes.value[palette.id] = palette
      })
      
      // Update the store state
      this.palettes = [...this.palettes, ...importedPalettes]
      
      console.log(`Successfully imported ${importedPalettes.length} palettes to local storage`)
      return importedPalettes
    },

    // Load JSONL file from server
    async loadJsonlFile() {
      this.loading = true
      this.error = null
      
      try {
        const config = useRuntimeConfig()
        const jsonlFilePath = config.public.imageMetadataJsonlFile
        
        if (!jsonlFilePath) {
          this.error = 'No JSONL file path configured'
          console.warn('IMAGE_METADATA_JSONL_FILE environment variable is not set')
          return []
        }
        
        console.log('Loading JSONL file from server:', jsonlFilePath)
        
        const response = await fetch('/api/jsonl/metadata')
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load JSONL file')
        }
        
        // Import the data
        const importedPalettes = await this.importPalettesFromJsonl(result.data)
        
        // Force offline mode after import
        this.toggleOfflineMode(true)
        
        return importedPalettes
      } catch (error) {
        console.error('Error loading JSONL file:', error)
        this.error = `Failed to load JSONL file: ${error.message}`
        return []
      } finally {
        this.loading = false
      }
    }
  }
})

// Add this alias for backward compatibility
export const usePalettesStore = usePaletteStore
