import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { usePalettesStore } from './palettes'
import { useRuntimeConfig } from '#app'
import { ref } from 'vue'

// Helper function to convert hex to rgb
function hexToRgb(hex) {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '')
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  return `rgb(${r}, ${g}, ${b})`
}

// Helper function to get a color name (simplified)
function getColorName(hex) {
  // This is a simplified version - in a real app, you might use a color naming library
  return 'Color ' + hex.substring(1, 7)
}

export const useImagesStore = defineStore('images', () => {
  // State
  const images = ref([])
  const loading = ref(false)
  const error = ref(null)
  const offlineMode = ref(true) // Default to offline mode
  
  // Auto-load JSONL file on initialization if in offline mode
  if (process.client) {
    // Check if we've already loaded images
    const localImages = useLocalStorage('images', {})
    if (Object.keys(localImages.value).length === 0) {
      // If no images are loaded yet, try to load from JSONL
      setTimeout(async () => {
        try {
          await loadJsonlFile()
        } catch (err) {
          console.error('Error auto-loading JSONL file:', err)
        }
      }, 500)
    }
  }
  
  // Import images from JSONL data
  async function importImagesFromJsonl(jsonlData) {
    if (!Array.isArray(jsonlData) || jsonlData.length === 0) {
      console.warn('No valid JSONL data to import')
      return []
    }
    
    // Transform JSONL data to image format
    const importedImages = jsonlData.map((item, index) => {
      // Generate a stable ID based on cached file path or use existing ID
      let id = item.id
      if (!id && item.cachedFilePath) {
        // Extract filename from path like "/images/img-1744076359500-227472209.jpeg"
        const filename = item.cachedFilePath.split('/').pop()
        if (filename && filename.startsWith('img-')) {
          // Remove file extension to get the ID
          id = filename.replace(/\.(jpeg|jpg|png|gif|webp)$/i, '')
        }
      }
      // Fallback to index-based ID if we still don't have one
      if (!id) {
        id = `img-${index}-${Date.now()}`
      }
      
      const imageData = {
        id: id,
        name: item.paletteName || `Image ${index + 1}`,
        url: item.uploadedURL || '',
        file_path: item.cachedFilePath || '',
        width: item.width || 0,
        height: item.height || 0,
        content_type: `image/${item.format}` || 'image/jpeg',
        file_size: item.fileSizeBytes || 0,
        description: `Imported from image_metadata.jsonl`,
        created_at: item.createdDateTime || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Store the color palette with the image
        colorPalette: item.colorPalette || [],
        // Include the original data for reference
        originalData: item
      }
      
      return imageData
    })
    
    // Store in local storage - OPTIMIZED: Batch operation
    const localImages = useLocalStorage('images', {})
    
    // Clear existing data first to avoid accumulation
    localImages.value = {}
    
    // Batch store all images at once
    const batchedImages = {}
    importedImages.forEach((image) => {
      batchedImages[image.id] = image
    })
    localImages.value = batchedImages
    
    // Update the store state
    images.value = [...importedImages]  // Don't append, replace
    
    // Debug: Log the first few image IDs
    console.log('📦 Imported image IDs:', importedImages.slice(0, 3).map(img => img.id))
    
    return importedImages
  }

  // Load JSONL file from server
  async function loadJsonlFile() {
    loading.value = true
    error.value = null
    
    try {
      const config = useRuntimeConfig()
      const jsonlFilePath = config.public.imageMetadataJsonlFile
      
      if (!jsonlFilePath) {
        error.value = 'No JSONL file path configured'
        console.warn('IMAGE_METADATA_JSONL_FILE environment variable is not set')
        return []
      }
      
      const response = await fetch('/api/jsonl/metadata')
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load JSONL file')
      }
      
      // Import the data
      const importedImages = await importImagesFromJsonl(result.data)
      
      // Also create palettes from these images
      if (importedImages.length > 0) {
        const palettesStore = usePalettesStore()
        
        // OPTIMIZED: Batch create palettes
        const palettesToCreate = {}
        for (const image of importedImages) {
          const palette = {
            id: `palette-${image.id}`,
            paletteName: image.name || 'Untitled Palette',
            description: `Generated from ${image.name || 'image'}`,
            colorPalette: Array.isArray(image.colorPalette) ? image.colorPalette : [],
            createdDateTime: image.created_at,
            uploadedURL: image.url || '',
            uploadedFilePath: null,
            cachedFilePath: image.file_path || '',
            width: image.width || 0,
            height: image.height || 0,
            format: image.content_type?.split('/')[1] || '',
            fileSizeBytes: image.file_size || 0
          }
          palettesToCreate[palette.id] = palette
        }
        
        // Batch store all palettes at once
        const localPalettes = useLocalStorage('color-palette-app-palettes', {})
        localPalettes.value = { ...localPalettes.value, ...palettesToCreate }
        
        // Toggle offline mode to ensure the palettes are loaded from local storage
        palettesStore.toggleOfflineMode(true)
      }
      
      // Force offline mode after import
      toggleOfflineMode(true)
      
      return importedImages
    } catch (err) {
      console.error('Error loading JSONL file:', err)
      error.value = `Failed to load JSONL file: ${err.message}`
      return []
    } finally {
      loading.value = false
    }
  }
  
  // Toggle offline mode
  function toggleOfflineMode(value) {
    offlineMode.value = value
    // OPTIMIZED: Use setItem directly instead of multiple operations
    localStorage.setItem('offlineMode', value ? 'true' : 'false')
  }
  
  // Clear all data and reset store (for debugging)
  function clearAllData() {
    localStorage.removeItem('images')
    localStorage.removeItem('color-palette-app-palettes')
    images.value = []
  }
  
  // Fetch images from API or local storage
  async function fetchImages() {
    if (offlineMode.value) {
      // Load from local storage - OPTIMIZED
      const localImages = useLocalStorage('images', {})
      const imageArray = Object.values(localImages.value)
      
      // SAFETY: Limit to max 50 images to prevent browser crashes
      const safeImages = imageArray.slice(0, 50)
      if (imageArray.length > 50) {
        console.warn('🚨 Too many images! Showing only first 50 to prevent browser crash')
      }
      
      images.value = safeImages
      return safeImages
    } else {
      // Try to fetch from API
      try {
        const response = await fetch('/api/images')
        if (response.ok) {
          const data = await response.json()
          images.value = Array.isArray(data) ? data.slice(0, 50) : []
          return images.value
        }
      } catch (err) {
        console.error('API fetch failed, falling back to local storage')
        return await fetchImages() // Retry with offline mode
      }
    }
  }
  
  // Get a single image by ID - OPTIMIZED
  async function getImage(id) {
    // Try local storage first
    const localImages = useLocalStorage('images', {})
    if (localImages.value[id]) return localImages.value[id]
    // Try to find in the images array
    const found = images.value.find(img => img.id === id)
    if (found) return found
    // Not found
    return null
  }
  
  // Update an image by ID - OPTIMIZED to reduce blocking
  async function updateImage(id, updatedData) {
    // Update in local storage - non-blocking
    setTimeout(() => {
      const localImages = useLocalStorage('images', {})
      if (localImages.value[id]) {
        localImages.value[id] = { ...localImages.value[id], ...updatedData }
      }
    }, 0)
    
    // Update in the images array immediately for UI responsiveness
    const idx = images.value.findIndex(img => img.id === id)
    if (idx !== -1) {
      images.value[idx] = { ...images.value[idx], ...updatedData }
    }
  }
  
  return {
    // State
    images,
    loading,
    error,
    offlineMode,
    
    // Actions
    importImagesFromJsonl,
    loadJsonlFile,
    toggleOfflineMode,
    clearAllData,
    fetchImages,
    getImage,
    updateImage
  }
})
