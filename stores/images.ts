import { defineStore } from 'pinia'
import type { Image, ImageApiResponse } from '~/types/image'

export const useImagesStore = defineStore('images', {
  state: () => {
    console.log('Initializing images store');
    return {
      images: [] as Image[],
      currentImage: null as Image | null,
      loading: false,
      error: null as string | null,
      page: 1,
      itemsPerPage: 12,
      totalImages: 0
    };
  },
  
  getters: {
    hasImages: (state) => state.images.length > 0,
    isLoading: (state) => state.loading,
    currentPage: (state) => state.page
  },
  
  actions: {
    // Transform API response to match your Image type
    transformImageData(image: any): Image {
      return {
        id: image.id,
        name: image.name,
        url: image.url,
        width: image.width || 0,
        height: image.height || 0,
        // Only include properties that exist in the Image type
        // Remove thumbnailUrl, createdAt, updatedAt, fileSize, fileType
      };
    },

    async fetchImages(options = { page: 1, limit: 12 }) {
      console.log('fetchImages called with options:', options);
      this.loading = true;
      this.error = null;
      
      try {
        // Set pagination parameters
        this.page = options.page
        this.itemsPerPage = options.limit
        
        // Fetch from API
        const response = await fetch(`/api/images?page=${options.page}&limit=${options.limit}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch images: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Raw API response:', data);
        
        // Check if the response is an array or an object with images property
        if (Array.isArray(data)) {
          // Transform each image to match your Image type
          this.images = data.map(this.transformImageData);
          this.totalImages = data.length;
          console.log('Processed array response, images count:', this.images.length);
        } else {
          // API returned an object with images property
          this.images = (data.images || []).map(this.transformImageData);
          this.totalImages = data.total || this.images.length;
          console.log('Processed object response, images count:', this.images.length);
        }
        
        return this.images;
      } catch (err: any) {
        this.error = err.message || 'Failed to load images';
        console.error('Error fetching images:', err);
        throw err;
      } finally {
        this.loading = false;
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
      if ('created_at' in image) {
        this.currentImage = {
          id: image.id,
          name: image.name,
          url: image.url,
          width: (image as ImageApiResponse).width || 0,
          height: (image as ImageApiResponse).height || 0,
          // Only include properties that exist in the Image type
          file_path: (image as ImageApiResponse).file_path || ''
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
