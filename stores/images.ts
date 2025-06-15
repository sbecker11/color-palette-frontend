import { defineStore } from 'pinia'
import type { Image, ImageApiResponse } from '~/types/image'

export const useImagesStore = defineStore('images', {
  state: () => ({
    images: [] as Image[],
    currentImage: null as Image | null,
    loading: false,
    error: null as string | null,
    page: 1,
    itemsPerPage: 12,
    totalImages: 0
  }),
  
  getters: {
    hasImages: (state) => state.images.length > 0,
    isLoading: (state) => state.loading,
    currentPage: (state) => state.page
  },
  
  actions: {
    async fetchImages(options = { page: 1, limit: 12 }) {
      this.loading = true
      this.error = null
      
      try {
        // Get the API client from the Nuxt app
        const nuxtApp = useNuxtApp()
        const api = nuxtApp.$api
        
        // Set pagination parameters
        this.page = options.page
        this.itemsPerPage = options.limit
        
        // Fetch from API
        const response = await fetch(`/api/images?page=${options.page}&limit=${options.limit}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch images: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Update state with fetched data
        this.images = data.images || []
        this.totalImages = data.total || this.images.length
        
        return this.images
      } catch (err: any) {
        this.error = err.message || 'Failed to load images'
        console.error('Error fetching images:', err)
        throw err
      } finally {
        this.loading = false
      }
    },
    
    async getImage(id: string) {
      this.loading = true
      this.error = null
      
      try {
        // Fetch from API
        const response = await fetch(`/api/images/${id}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`)
        }
        
        const data = await response.json()
        this.setCurrentImage(data)
        return this.currentImage
      } catch (err: any) {
        this.error = err.message || 'Failed to load image'
        console.error('Error fetching image:', err)
        throw err
      } finally {
        this.loading = false
      }
    },
    
    setCurrentImage(image: ImageApiResponse | Image) {
      // Transform ImageApiResponse to Image if needed
      if ('thumbnail_url' in image || 'created_at' in image) {
        this.currentImage = {
          id: image.id,
          name: image.name,
          url: image.url,
          thumbnailUrl: (image as ImageApiResponse).thumbnail_url || (image as ImageApiResponse).thumbnailUrl || '',
          createdAt: (image as ImageApiResponse).created_at || (image as ImageApiResponse).createdAt || new Date().toISOString(),
          updatedAt: (image as ImageApiResponse).updated_at || (image as ImageApiResponse).updatedAt || new Date().toISOString(),
          width: (image as ImageApiResponse).width || 0,
          height: (image as ImageApiResponse).height || 0,
          fileSize: (image as ImageApiResponse).file_size || (image as ImageApiResponse).fileSize || 0,
          fileType: (image as ImageApiResponse).content_type || (image as ImageApiResponse).file_type || (image as ImageApiResponse).fileType || '',
          colors: (image as ImageApiResponse).colors || []
        }
      } else {
        this.currentImage = image as Image
      }
    },
    
    async uploadImage(name: string, file: File) {
      this.loading = true
      this.error = null
      
      try {
        // Create a FormData object to send the file
        const formData = new FormData()
        formData.append('name', name)
        formData.append('file', file)
        
        // Send the request to the API
        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error(`Failed to upload image: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Refresh the images list
        await this.fetchImages()
        
        return data
      } catch (err: any) {
        this.error = err.message || 'Failed to upload image'
        console.error('Error uploading image:', err)
        throw err
      } finally {
        this.loading = false
      }
    },
    
    async uploadImageFromUrl(name: string, url: string) {
      this.loading = true
      this.error = null
      
      try {
        // Send the request to the API
        const response = await fetch('/api/images/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, url })
        })
        
        if (!response.ok) {
          throw new Error(`Failed to upload image from URL: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Refresh the images list
        await this.fetchImages()
        
        return data
      } catch (err: any) {
        this.error = err.message || 'Failed to upload image from URL'
        console.error('Error uploading image from URL:', err)
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
