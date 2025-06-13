import { defineStore } from 'pinia'
import type { Image, ImageCreatePayload, ImageUpdatePayload } from '~/types/image'
import type { ApiResponse, PaginatedResponse } from '~/types/api'

export const useImagesStore = defineStore('images', () => {
  // State
  const images = ref<Image[]>([])
  const currentImage = ref<Image | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    currentPage: 1,
    perPage: 20,
    totalPages: 0,
    totalCount: 0
  })

  // Getters
  const getImageById = computed(() => {
    return (id: string) => images.value.find(image => image.id === id)
  })

  const hasImages = computed(() => images.value.length > 0)

  const isLoading = computed(() => loading.value)

  // Actions
  const fetchImages = async (page = 1, search = '') => {
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

      const response = await $api<PaginatedResponse<Image>>(`/images?${params}`)
      
      images.value = response.images
      pagination.value = {
        currentPage: response.meta.current_page,
        perPage: response.meta.per_page,
        totalPages: response.meta.total_pages,
        totalCount: response.meta.total_count
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch images'
      console.error('Error fetching images:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchImage = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { $api } = useNuxtApp()
      const response = await $api<{ image: Image }>(`/images/${id}`)
      
      currentImage.value = response.image
      
      // Update the image in the list if it exists
      const index = images.value.findIndex(img => img.id === id)
      if (index !== -1) {
        images.value[index] = response.image
      }
      
      return response.image
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch image'
      console.error('Error fetching image:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createImage = async (payload: ImageCreatePayload) => {
    loading.value = true
    error.value = null

    try {
      const { $api } = useNuxtApp()
      const response = await $api<{ image: Image }>('/images', {
        method: 'POST',
        body: { image: payload }
      })
      
      images.value.unshift(response.image)
      pagination.value.totalCount++
      
      return response.image
    } catch (err: any) {
      error.value = err.message || 'Failed to create image'
      console.error('Error creating image:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateImage = async (id: string, payload: ImageUpdatePayload) => {
    loading.value = true
    error.value = null

    try {
      const { $api } = useNuxtApp()
      const response = await $api<{ image: Image }>(`/images/${id}`, {
        method: 'PUT',
        body: { image: payload }
      })
      
      const index = images.value.findIndex(img => img.id === id)
      if (index !== -1) {
        images.value[index] = response.image
      }
      
      if (currentImage.value?.id === id) {
        currentImage.value = response.image
      }
      
      return response.image
    } catch (err: any) {
      error.value = err.message || 'Failed to update image'
      console.error('Error updating image:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteImage = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { $api } = useNuxtApp()
      await $api(`/images/${id}`, { method: 'DELETE' })
      
      images.value = images.value.filter(img => img.id !== id)
      pagination.value.totalCount--
      
      if (currentImage.value?.id === id) {
        currentImage.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete image'
      console.error('Error deleting image:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const analyzeColors = async (id: string, numColors = 5) => {
    loading.value = true
    error.value = null

    try {
      const { $api } = useNuxtApp()
      const response = await $api<{ colors: any[], meta: any }>(`/images/${id}/analyze_colors`, {
        method: 'POST',
        body: { num_colors: numColors }
      })
      
      return response.colors
    } catch (err: any) {
      error.value = err.message || 'Failed to analyze colors'
      console.error('Error analyzing colors:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const samplePixel = async (id: string, x: number, y: number) => {
    try {
      const { $api } = useNuxtApp()
      const response = await $api<{ color: any, meta: any }>(`/images/${id}/sample_pixel?x=${x}&y=${y}`)
      
      return response.color
    } catch (err: any) {
      error.value = err.message || 'Failed to sample pixel'
      console.error('Error sampling pixel:', err)
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  const setCurrentImage = (image: Image | null) => {
    currentImage.value = image
  }

  return {
    // State
    images: readonly(images),
    currentImage: readonly(currentImage),
    loading: readonly(loading),
    error: readonly(error),
    pagination: readonly(pagination),
    
    // Getters
    getImageById,
    hasImages,
    isLoading,
    
    // Actions
    fetchImages,
    fetchImage,
    createImage,
    updateImage,
    deleteImage,
    analyzeColors,
    samplePixel,
    clearError,
    setCurrentImage
  }
})
