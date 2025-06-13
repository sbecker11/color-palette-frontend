import { defineStore } from 'pinia'
import type { Palette, PaletteCreatePayload, PaletteUpdatePayload, ColorData } from '~/types/palette'
import type { PaginatedResponse } from '~/types/api'

export const usePalettesStore = defineStore('palettes', () => {
  // State
  const palettes = ref<Palette[]>([])
  const currentPalette = ref<Palette | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    currentPage: 1,
    perPage: 20,
    totalPages: 0,
    totalCount: 0
  })

  // Getters
  const getPaletteById = computed(() => {
    return (id: string) => palettes.value.find(palette => palette.id === id)
  })

  const hasPalettes = computed(() => palettes.value.length > 0)

  const isLoading = computed(() => loading.value)

  const currentPaletteColors = computed(() => {
    return currentPalette.value?.colors || []
  })

  // Actions
  const fetchPalettes = async (imageId: string, page = 1, search = '') => {
    loading.value = true
    error.value = null

    try {
      const { $api } = useNuxtApp()
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.value.perPage.toString()
      })
      
      if (search) {
        params.append('search', search)
      }

      const response = await $api<PaginatedResponse<Palette>>(`/images/${imageId}/palettes?${params}`)
      
      palettes.value = response.palettes
      pagination.value = {
        currentPage: response.meta.current_page,
        perPage: response.meta.per_page,
        totalPages: response.meta.total_pages,
        totalCount: response.meta.total_count
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch palettes'
      console.error('Error fetching palettes:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchPalette = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { $api } = useNuxtApp()
      const response = await $api<{ palette: Palette }>(`/palettes/${id}`)
      
      currentPalette.value = response.palette
      
      // Update the palette in the list if it exists
      const index = palettes.value.findIndex(p => p.id === id)
      if (index !== -1) {
        palettes.value[index] = response.palette
      }
      
      return response.palette
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch palette'
      console.error('Error fetching palette:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPalette = async (imageId: string, payload: PaletteCreatePayload) => {
    loading.value = true
    error.value = null

    try {
      const { $api } = useNuxtApp()
      const response = await $api<{ palette: Palette }>(`/images/${imageId}/palettes`, {
        method: 'POST',
        body: { palette: payload }
      })
      
      palettes.value.unshift(response.palette)
      pagination.value.totalCount++
      
      return response.palette
    } catch (err: any) {
      error.value = err.message || 'Failed to create palette'
      console.error('Error creating palette:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePalette = async (id: string, payload: PaletteUpdatePayload) => {
    loading.value = true
    error.value = null

    try {
      const { $api } = useNuxtApp()
      const response = await $api<{ palette: Palette }>(`/palettes/${id}`, {
        method: 'PUT',
        body: { palette: payload }
      })
      
      const index = palettes.value.findIndex(p => p.id === id)
      if (index !== -1) {
        palettes.value[index] = response.palette
      }
      
      if (currentPalette.value?.id === id) {
        currentPalette.value = response.palette
      }
      
      return response.palette
    } catch (err: any) {
      error.value = err.message || 'Failed to update palette'
      console.error('Error updating palette:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePalette = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { $api } = useNuxtApp()
      await $api(`/palettes/${id}`, { method: 'DELETE' })
      
      palettes.value = palettes.value.filter(p => p.id !== id)
      pagination.value.totalCount--
      
      if (currentPalette.value?.id === id) {
        currentPalette.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete palette'
      console.error('Error deleting palette:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportPalette = async (id: string, format = 'flock_of_postcards') => {
    loading.value = true
    error.value = null

    try {
      const { $api } = useNuxtApp()
      const response = await $api<{ data: any, meta: any }>(`/palettes/${id}/export?format=${format}`)
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to export palette'
      console.error('Error exporting palette:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Color manipulation actions
  const addColorToPalette = (color: ColorData) => {
    if (!currentPalette.value) return

    const newColor = {
      ...color,
      id: crypto.randomUUID(),
      position: currentPalette.value.colors.length
    }

    currentPalette.value.colors.push(newColor)
  }

  const updateColorInPalette = (colorId: string, updates: Partial<ColorData>) => {
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
    }).filter(Boolean) as ColorData[]

    currentPalette.value.colors = reorderedColors
  }

  const clearError = () => {
    error.value = null
  }

  const setCurrentPalette = (palette: Palette | null) => {
    currentPalette.value = palette
  }

  const createPaletteFromColors = (name: string, colors: ColorData[], imageId: string) => {
    const paletteData: PaletteCreatePayload = {
      name,
      colors: colors.map((color, index) => ({
        ...color,
        id: crypto.randomUUID(),
        position: index
      })),
      description: `Generated palette with ${colors.length} colors`
    }

    return createPalette(imageId, paletteData)
  }

  return {
    // State
    palettes: readonly(palettes),
    currentPalette: readonly(currentPalette),
    loading: readonly(loading),
    error: readonly(error),
    pagination: readonly(pagination),
    
    // Getters
    getPaletteById,
    hasPalettes,
    isLoading,
    currentPaletteColors,
    
    // Actions
    fetchPalettes,
    fetchPalette,
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
