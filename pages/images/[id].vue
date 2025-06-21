<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg my-4">
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>
    
    <div v-else-if="image" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <!-- Image header with back button -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div class="flex items-center">
          <button 
            @click="router.back()" 
            class="mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <h1 class="text-xl font-bold">{{ image.name }}</h1>
        </div>
        
        <NuxtLink 
          :to="`/palettes/palette-${image.id}`" 
          class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition"
        >
          View Palette
        </NuxtLink>
      </div>
      
      <!-- Image content -->
      <div class="flex flex-col md:flex-row">
        <!-- Image preview -->
        <div class="w-full md:w-2/3 p-4">
          <div class="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
            <img 
              v-if="image.url" 
              :src="image.url" 
              :alt="image.name" 
              class="w-full h-auto object-contain max-h-[600px]"
              @error="handleImageError"
            />
            <div v-else class="w-full h-64 flex items-center justify-center">
              <span class="text-gray-500 dark:text-gray-400">No image available</span>
            </div>
          </div>
        </div>
        
        <!-- Image details and color palette -->
        <div class="w-full md:w-1/3 p-4">
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-2">Image Details</h2>
            <div class="space-y-2 text-sm">
              <div><span class="font-medium">Dimensions:</span> {{ image.width || 'N/A' }} × {{ image.height || 'N/A' }}</div>
              <div><span class="font-medium">Format:</span> {{ image.content_type ? image.content_type.split('/')[1].toUpperCase() : 'N/A' }}</div>
              <div><span class="font-medium">Size:</span> {{ formatFileSize(image.file_size) }}</div>
              <div><span class="font-medium">Created:</span> {{ formatDate(image.created_at) }}</div>
            </div>
          </div>
          
          <div>
            <h2 class="text-lg font-semibold mb-2">Color Palette</h2>
            <div class="grid grid-cols-2 gap-2">
              <div 
                v-for="(color, index) in image.colorPalette" 
                :key="index"
                class="flex items-center space-x-2"
              >
                <div 
                  class="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600"
                  :style="{ backgroundColor: color }"
                ></div>
                <div class="text-sm font-mono">{{ color }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-12">
      <p class="text-gray-600 dark:text-gray-400">Image not found.</p>
      <NuxtLink 
        to="/" 
        class="mt-4 inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
      >
        Back to Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useImagesStore } from '~/stores/images'

const route = useRoute()
const router = useRouter()
const imagesStore = useImagesStore()

const loading = ref(true)
const error = ref<string | null>(null)
const image = ref<any>(null)

// Get the image ID from the route
const imageId = computed(() => route.params.id as string)

// Fetch the image when the component is mounted
onMounted(async () => {
  try {
    loading.value = true
    
    // Fetch the image from the store
    const result = await imagesStore.getImage(imageId.value)
    
    if (!result) {
      error.value = 'Image not found'
    } else {
      image.value = result
    }
  } catch (err: any) {
    console.error('Error fetching image:', err)
    error.value = 'Failed to load image. Please try again.'
  } finally {
    loading.value = false
  }
})

// Format file size
function formatFileSize(bytes: number): string {
  if (!bytes) return 'N/A'
  
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

// Format date
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Handle image loading errors
function handleImageError(e: Event): void {
  const imgSrc = (e.target as HTMLImageElement).src;
  console.error('Image failed to load:', imgSrc);
  
  // Use a data URI for a fallback image - this is guaranteed to work locally
  (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22600%22%20viewBox%3D%220%200%20800%20600%22%3E%3Crect%20fill%3D%22%23f0f0f0%22%20width%3D%22800%22%20height%3D%22600%22%2F%3E%3Ctext%20fill%3D%22%23999999%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22400%22%20y%3D%22300%22%3EImage%20Not%20Available%3C%2Ftext%3E%3C%2Fsvg%3E';
}
</script>
