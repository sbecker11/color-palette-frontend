import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'
import type { Color, Palette, CreatePaletteParams } from '~/types/palette'

export const usePalettesStore = defineStore('palettes', () => {
  const nuxtApp = useNuxtApp()
  
  const palettes = ref<Palette[]>([])
  const currentPalette = ref<Palette | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Computed property to check if there are palettes
  const hasPalettes = computed(() => palettes.value.length > 0)
  
  // Fetch all palettes
  async function fetchPalettes(): Promise<Palette[]> {
    isLoading.value = true
    error.value = null
    
    try {
      if (!nuxtApp.$api) {
        throw new Error('API client not available')
      }
      
      const response = await nuxtApp.$api.get<Palette[]>('/palettes')
      // Use type assertion to tell TypeScript this is definitely a Palette[]
      const typedResponse = response as Palette[]
      palettes.value = typedResponse
      return typedResponse
    } catch (err: any) {
      console.error('Error fetching palettes:', err)
      error.value = err.message || 'Failed to fetch palettes'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Fetch palettes by image ID
  async function fetchPalettesByImage(imageId: string): Promise<Palette[]> {
    isLoading.value = true
    error.value = null
    
    try {
      if (!nuxtApp.$api) {
        throw new Error('API client not available')
      }
      
      const response = await nuxtApp.$api.get<Palette[]>(`/images/${imageId}/palettes`)
      return Array.isArray(response) ? response as Palette[] : []
    } catch (err: any) {
      console.error(`Error fetching palettes for image ${imageId}:`, err)
      error.value = err.message || 'Failed to fetch palettes for this image'
      return [] // Return empty array on error
    } finally {
      isLoading.value = false
    }
  }
  
  // Fetch a palette by ID
  async function fetchPaletteById(id: string): Promise<Palette> {
    isLoading.value = true
    error.value = null
    
    try {
      if (!nuxtApp.$api) {
        throw new Error('API client not available')
      }
      
      const response = await nuxtApp.$api.get<Palette>(`/palettes/${id}`)
      // Use type assertion to tell TypeScript this is definitely a Palette
      const typedResponse = response as Palette
      currentPalette.value = typedResponse
      return typedResponse
    } catch (err: any) {
      console.error(`Error fetching palette ${id}:`, err)
      error.value = err.message || 'Failed to fetch palette'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Create a new palette
  async function createPalette(params: CreatePaletteParams): Promise<Palette> {
    isLoading.value = true
    error.value = null
    
    try {
      if (!nuxtApp.$api) {
        throw new Error('API client not available')
      }
      
      const response = await nuxtApp.$api.post<Palette>('/palettes', params)
      // Use type assertion to tell TypeScript this is definitely a Palette
      const typedResponse = response as Palette
      
      // Add the new palette to the beginning of the palettes array
      palettes.value = [typedResponse, ...palettes.value]
      
      return typedResponse
    } catch (err: any) {
      console.error('Error creating palette:', err)
      error.value = err.message || 'Failed to create palette'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Update a palette
  async function updatePalette(id: string, updates: Partial<Palette>) {
    isLoading.value = true
    error.value = null
    
    try {
      if (!nuxtApp.$api) {
        throw new Error('API client not available')
      }
      
      const response = await nuxtApp.$api.put<Palette>(`/palettes/${id}`, updates)
      // Use type assertion to tell TypeScript this is definitely a Palette
      const typedResponse = response as Palette
      
      // Update the palette in the palettes array
      const index = palettes.value.findIndex(p => p.id === id)
      if (index !== -1) {
        palettes.value[index] = { ...palettes.value[index], ...typedResponse }
      }
      
      // If the current palette is being updated, update it as well
      if (currentPalette.value && currentPalette.value.id === id) {
        currentPalette.value = { ...currentPalette.value, ...typedResponse }
      }
      
      return typedResponse
    } catch (err: any) {
      console.error(`Error updating palette ${id}:`, err)
      error.value = err.message || 'Failed to update palette'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Delete a palette
  async function deletePalette(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      if (!nuxtApp.$api) {
        throw new Error('API client not available')
      }
      
      await nuxtApp.$api.delete(`/palettes/${id}`)
      
      // Remove the palette from the palettes array
      palettes.value = palettes.value.filter(p => p.id !== id)
      
      // If the current palette is the one being deleted, clear it
      if (currentPalette.value && currentPalette.value.id === id) {
        currentPalette.value = null
      }
    } catch (err: any) {
      console.error(`Error deleting palette ${id}:`, err)
      error.value = err.message || 'Failed to delete palette'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Export a palette
  async function exportPalette(id: string, format = 'flock_of_postcards') {
    isLoading.value = true
    error.value = null
    
    try {
      if (!nuxtApp.$api) {
        throw new Error('API client not available')
      }
      
      const response = await nuxtApp.$api.get<{ data: any, meta: any }>(`/palettes/${id}/export?format=${format}`)
      
      return response
    } catch (err: any) {
      console.error(`Error exporting palette ${id}:`, err)
      error.value = err.message || 'Failed to export palette'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Color manipulation actions
  const addColorToPalette = (color: Color) => {
    if (!currentPalette.value) return

    const newColor = {
      ...color,
      id: crypto.randomUUID(),
      position: currentPalette.value.colors.length
    }

    currentPalette.value.colors.push(newColor)
  }

  const updateColorInPalette = (colorId: string, updates: Partial<Color>) => {
    if (!currentPalette.value) return

    const colorIndex = currentPalette.value.colors.findIndex(c => c.id === colorId)
    if (colorIndex === -1) return

    currentPalette.value.colors[colorIndex] = {
      ...currentPalette.value.colors[colorIndex],
      ...updates
    }
  }

  const removeColorFromPalette = (colorId: string) => {
    if (!currentPalette.value) return

    currentPalette.value.colors = currentPalette.value.colors.filter(c => c.id !== colorId)
    
    // Reorder positions
    currentPalette.value.colors.forEach((color, index) => {
      color.position = index
    })
  }

  const reorderColorsInPalette = (colorIds: string[]) => {
    if (!currentPalette.value) return

    const reorderedColors = colorIds.map((id, index) => {
      const color = currentPalette.value!.colors.find(c => c.id === id)
      if (color) {
        return { ...color, position: index }
      }
      return null
    }).filter(Boolean) as Color[]

    currentPalette.value.colors = reorderedColors
  }

  const clearError = () => {
    error.value = null
  }

  const setCurrentPalette = (palette: Palette | null) => {
    currentPalette.value = palette
  }

  const createPaletteFromColors = (name: string, colors: Color[], imageId: string) => {
    const paletteData: CreatePaletteParams = {
      name,
      imageId,
      colors: colors.map((color, index) => ({
        ...color,
        id: crypto.randomUUID(),
        position: index
      })),
      description: `Generated palette with ${colors.length} colors`
    }

    return createPalette(paletteData)
  }

  return {
    // State
    palettes: readonly(palettes),
    currentPalette: readonly(currentPalette),
    loading: readonly(isLoading),
    error: readonly(error),
    
    // Getters
    hasPalettes,
    
    // Actions
    fetchPalettes,
    fetchPalettesByImage,
    fetchPaletteById,
    createPalette,
    updatePalette,
    deletePalette,
    exportPalette,
    addColorToPalette,
    updateColorInPalette,
    removeColorFromPalette,
    reorderColorsInPalette,
    clearError,
    setCurrentPalette,
    createPaletteFromColors
  }
})
