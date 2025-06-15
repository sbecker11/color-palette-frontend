import { defineStore } from 'pinia'
import type { ImageListResponse, ImageUploadResponse } from '~/types/image'
import type { Image as ImageType } from '~/types/image'
import type { PaginationParams } from '~/types/api'

// Extend the imported Image type
interface Image extends ImageType {
  colors?: Array<{
    hex: string
    rgb: string
    name: string
  }>
}

function debugDateFormat(image: any, source: string) {
  console.group(`Date debugging from ${source}`)
  console.log('Image object:', image)
  
  if (image && image.createdAt) {
    console.log('createdAt value:', image.createdAt)
    console.log('createdAt type:', typeof image.createdAt)
    
    // Try to parse the date
    const date = new Date(image.createdAt)
    console.log('Parsed as Date object:', date)
    console.log('Is valid date?', !isNaN(date.getTime()))
    console.log('toLocaleDateString():', date.toLocaleDateString())
    console.log('toISOString():', date.toISOString())
  } else {
    console.log('No createdAt property found')
  }
  
  console.groupEnd()
}

export const useImagesStore = defineStore('images', () => {
  const nuxtApp = useNuxtApp()
  
  const images = ref<Image[]>([])
  const currentImage = ref<Image | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const totalImages = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref(12)

  const hasImages = computed(() => images.value.length > 0)

  // Helper function to generate mock image response
  function getMockImageResponse(params?: PaginationParams): ImageListResponse {
    const page = params?.page || currentPage.value
    const limit = params?.limit || itemsPerPage.value
    const total = 50 // Mock total count
    
    const mockImages = Array.from({ length: limit }, (_, i) => {
      const id = `mock-${(page - 1) * limit + i + 1}`
      return {
        id,
        name: `Mock Image ${id}`,
        url: `https://picsum.photos/seed/${id}/800/600`,
        thumbnailUrl: `https://picsum.photos/seed/${id}/400/300`,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
        width: 800,
        height: 600,
        fileSize: 2048 * 1024,
        fileType: 'image/jpeg',
        colors: [
          { hex: '#FF5733', rgb: 'rgb(255, 87, 51)', name: 'Coral Red' },
          { hex: '#33FF57', rgb: 'rgb(51, 255, 87)', name: 'Lime Green' },
          { hex: '#3357FF', rgb: 'rgb(51, 87, 255)', name: 'Royal Blue' },
          { hex: '#F3FF33', rgb: 'rgb(243, 255, 51)', name: 'Bright Yellow' },
          { hex: '#33FFF3', rgb: 'rgb(51, 255, 243)', name: 'Aqua' }
        ]
      }
    })
    
    return {
      images: mockImages,
      total,
      page,
      limit
    }
  }

  async function fetchImages(params?: PaginationParams) {
    isLoading.value = true
    error.value = null
    
    try {
      // Make sure we have access to the API client
      if (!nuxtApp.$api) {
        throw new Error('API client not available')
      }
      
      // Check if API is available before proceeding
      if (!nuxtApp.$api.isAvailable()) {
        console.log('API not marked as available, checking availability...')
        const available = await nuxtApp.$api.checkAvailability()
        
        if (!available && process.env.NODE_ENV === 'development') {
          console.log('API not available, using mock data')
          const mockResponse = getMockImageResponse(params)
          images.value = mockResponse.images
          totalImages.value = mockResponse.total || mockResponse.images.length
          currentPage.value = mockResponse.page || 1
          return mockResponse
        }
      }
      
      console.log('Fetching images with params:', params)
      
      const response = await nuxtApp.$api.get<any>('/images', {
        page: params?.page || currentPage.value,
        limit: params?.limit || itemsPerPage.value,
        search: params?.search,
        sortBy: params?.sortBy || 'created_at', // Use snake_case for API
        sortOrder: params?.sortOrder || 'desc'
      })
      
      // Handle different response formats
      if (Array.isArray(response)) {
        console.log('API returned an array of images:', response.length)
        
        // Convert snake_case to camelCase for date fields
        const processedImages = response.map(img => ({
          id: img.id,
          name: img.name,
          url: img.url,
          thumbnailUrl: img.thumbnail_url || img.thumbnailUrl,
          createdAt: img.created_at || img.createdAt,
          updatedAt: img.updated_at || img.updatedAt,
          width: img.width,
          height: img.height,
          fileSize: img.file_size || img.fileSize,
          fileType: img.content_type || img.file_type || img.fileType,
          colors: img.colors
        })) as Image[]
        
        images.value = processedImages
        totalImages.value = processedImages.length
        currentPage.value = params?.page || 1
        
        return {
          images: processedImages,
          total: processedImages.length,
          page: params?.page || 1,
          limit: params?.limit || itemsPerPage.value
        }
      } else if (response && response.images) {
        // Convert snake_case to camelCase for date fields
        const processedImages = response.images.map(img => ({
          id: img.id,
          name: img.name,
          url: img.url,
          thumbnailUrl: img.thumbnail_url || img.thumbnailUrl,
          createdAt: img.created_at || img.createdAt,
          updatedAt: img.updated_at || img.updatedAt,
          width: img.width,
          height: img.height,
          fileSize: img.file_size || img.fileSize,
          fileType: img.content_type || img.file_type || img.fileType,
          colors: img.colors
        })) as Image[]
        
        images.value = processedImages
        totalImages.value = response.total || processedImages.length
        currentPage.value = response.page || 1
        
        return {
          ...response,
          images: processedImages
        }
      } else {
        console.warn('Invalid response format from API:', response)
        images.value = []
        totalImages.value = 0
        
        return {
          images: [],
          total: 0,
          page: 1,
          limit: itemsPerPage.value
        }
      }
    } catch (err: any) {
      console.error('Error fetching images:', err)
      error.value = err.message || 'Failed to load images. Please try again.'
      
      // Don't throw the error, just return an empty response
      return {
        images: [],
        total: 0,
        page: 1,
        limit: itemsPerPage.value
      }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchImageById(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      if (!nuxtApp.$api) {
        throw new Error('API client not available')
      }
      
      const response = await nuxtApp.$api.get<Image>(`/images/${id}`)
      currentImage.value = response
      return response
    } catch (err: any) {
      console.error('Error fetching image:', err)
      error.value = err.message || 'Failed to load image. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function getImage(id: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      if (!nuxtApp.$api) {
        throw new Error('API client not available');
      }
      
      // Use mock data if API is not available (for development)
      if (process.env.NODE_ENV === 'development') {
        try {
          // Use 'any' type for the response to handle both camelCase and snake_case properties
          const response = await nuxtApp.$api.get<any>(`/images/${id}`);
          
          // Convert snake_case to camelCase
          const processedImage: Image = {
            id: response.id,
            name: response.name,
            url: response.url,
            thumbnailUrl: response.thumbnail_url || response.thumbnailUrl,
            createdAt: response.created_at || response.createdAt,
            updatedAt: response.updated_at || response.updatedAt,
            width: response.width,
            height: response.height,
            fileSize: response.file_size || response.fileSize,
            fileType: response.content_type || response.file_type || response.fileType
          };
          
          return processedImage;
        } catch (err) {
          console.log('API error, using mock data for single image');
          
          // Generate a mock image with the requested ID
          const mockImage: Image = {
            id: id,
            name: `Mock Image ${id}`,
            url: `https://picsum.photos/seed/${id}/800/600`,
            thumbnailUrl: `https://picsum.photos/seed/${id}/400/300`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            width: 800,
            height: 600,
            fileSize: 2048 * 1024,
            fileType: 'image/jpeg',
            // Add mock colors for the palette
            colors: [
              { hex: '#FF5733', rgb: 'rgb(255, 87, 51)', name: 'Coral Red' },
              { hex: '#33FF57', rgb: 'rgb(51, 255, 87)', name: 'Lime Green' },
              { hex: '#3357FF', rgb: 'rgb(51, 87, 255)', name: 'Royal Blue' },
              { hex: '#F3FF33', rgb: 'rgb(243, 255, 51)', name: 'Bright Yellow' },
              { hex: '#33FFF3', rgb: 'rgb(51, 255, 243)', name: 'Aqua' }
            ]
          };
          
          return mockImage;
        }
      } else {
        // Production mode - only use real API
        // Use 'any' type for the response to handle both camelCase and snake_case properties
        const response = await nuxtApp.$api.get<any>(`/images/${id}`);
        
        // Convert snake_case to camelCase
        const processedImage: Image = {
          id: response.id,
          name: response.name,
          url: response.url,
          thumbnailUrl: response.thumbnail_url || response.thumbnailUrl,
          createdAt: response.created_at || response.createdAt,
          updatedAt: response.updated_at || response.updatedAt,
          width: response.width,
          height: response.height,
          fileSize: response.file_size || response.fileSize,
          fileType: response.content_type || response.file_type || response.fileType
        };
        
        return processedImage;
      }
    } catch (err: any) {
      console.error('Error fetching image:', err);
      error.value = err.message || 'Failed to load image. Please try again.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function uploadImage(name: string, file: File) {
    isLoading.value = true
    error.value = null
    
    try {
      if (!nuxtApp.$api) {
        throw new Error('API client not available')
      }
      
      const formData = new FormData()
      formData.append('name', name)
      formData.append('image', file)
      
      const response = await nuxtApp.$api.post<ImageUploadResponse>('/images', formData)
      
      // Add the new image to the beginning of the images array
      // Convert ImageUploadResponse to Image by adding missing properties
      const newImage: Image = {
        ...response,
        updatedAt: response.createdAt,
        width: 0,
        height: 0,
        fileSize: 0,
        fileType: ''
      }
      
      images.value = [newImage, ...images.value]
      totalImages.value++
      
      return response
    } catch (err: any) {
      console.error('Error uploading image:', err)
      error.value = err.message || 'Failed to upload image. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function uploadImageFromUrl(name: string, url: string) {
    isLoading.value = true
    error.value = null
    
    try {
      if (!nuxtApp.$api) {
        throw new Error('API client not available')
      }
      
      const response = await nuxtApp.$api.post<ImageUploadResponse>('/images', {
        name,
        url
      })
      
      // Add the new image to the beginning of the images array
      const newImage: Image = {
        ...response,
        updatedAt: response.createdAt,
        width: 0,
        height: 0,
        fileSize: 0,
        fileType: ''
      }
      
      images.value = [newImage, ...images.value]
      totalImages.value++
      
      return response
    } catch (err: any) {
      console.error('Error uploading image from URL:', err)
      error.value = err.message || 'Failed to upload image from URL. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteImage(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      if (!nuxtApp.$api) {
        throw new Error('API client not available')
      }
      
      await nuxtApp.$api.delete(`/images/${id}`)
      
      // Remove the deleted image from the images array
      images.value = images.value.filter(image => image.id !== id)
      totalImages.value--
      
      return true
    } catch (err: any) {
      console.error('Error deleting image:', err)
      error.value = err.message || 'Failed to delete image. Please try again.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    images,
    currentImage,
    isLoading,
    error,
    hasImages,
    totalImages,
    currentPage,
    itemsPerPage,
    fetchImages,
    fetchImageById,
    getImage,
    uploadImage,
    uploadImageFromUrl,
    deleteImage
  }
})
