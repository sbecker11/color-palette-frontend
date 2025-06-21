<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Color Palette Maker</h1>
    
    <!-- JSONL file status -->
    <div v-if="showJsonlPrompt && jsonlFilePath" class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-blue-800 dark:text-blue-300">
            No images found
          </h3>
          <div class="mt-2 text-sm text-blue-700 dark:text-blue-200">
            <p>
              Would you like to load images and palettes from the configured JSONL file?
              <br>
              <span class="text-xs text-blue-600 dark:text-blue-300">{{ jsonlFilePath }}</span>
            </p>
          </div>
          <div class="mt-3">
            <div class="flex space-x-2">
              <button
                type="button"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                @click="loadJsonlData"
                :disabled="loading"
              >
                {{ loading ? 'Loading...' : 'Load JSONL Data' }}
              </button>
              <button
                type="button"
                class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                @click="showJsonlPrompt = false"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Image grid -->
    <div v-if="images.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="image in images" :key="image.id" class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div class="relative h-48 overflow-hidden cursor-pointer" @click="navigateToPalette(image.id)">
          <img 
            v-if="image.url" 
            :src="image.url" 
            :alt="image.name" 
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            @error="handleImageError"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <span class="text-gray-500 dark:text-gray-400">No image</span>
          </div>
          <!-- Overlay to indicate it's clickable -->
          <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
            <div class="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
              <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2 truncate">{{ image.name }}</h3>
          
          <div class="flex space-x-1 mb-3">
            <div 
              v-for="(color, index) in image.colorPalette?.slice(0, 5)" 
              :key="index"
              class="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
              :style="{ backgroundColor: color }"
              :title="color"
            ></div>
            <div v-if="image.colorPalette?.length > 5" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
              +{{ image.colorPalette.length - 5 }}
            </div>
          </div>
          
          <div class="flex space-x-2">
            <NuxtLink 
              :to="`/images/${image.id}`" 
              class="flex-1 text-center py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              View Image
            </NuxtLink>
            <NuxtLink 
              :to="`/palettes/${image.id}`" 
              class="flex-1 text-center py-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition"
            >
              View Palette
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else-if="!loading" class="text-center py-12">
      <p class="text-gray-600 dark:text-gray-400">No images found.</p>
      <button 
        v-if="jsonlFilePath && !showJsonlPrompt" 
        @click="showJsonlPrompt = true"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Load from JSONL
      </button>
      
      <!-- Temporary debug button -->
      <div class="mt-4 p-4 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20">
        <p class="text-sm text-red-600 dark:text-red-400 mb-2">Debug: Clear corrupted localStorage data</p>
        <button 
          @click="clearData"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🧹 Clear All Data & Reload
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useImagesStore } from '~/stores/images'
import { useRuntimeConfig } from '#app'
import { useRouter } from 'vue-router'

const imagesStore = useImagesStore()
const config = useRuntimeConfig()
const router = useRouter()
const jsonlFilePath = computed(() => config.public.imageMetadataJsonlFile)

const loading = ref(false)
const error = ref<string | null>(null)
const showJsonlPrompt = ref(false)

// Get images from the store
const images = computed(() => {
  const imageCount = imagesStore.images.length
  
  // SAFETY: Limit to max 50 images to prevent browser crashes
  const safeImages = imagesStore.images.slice(0, 50)
  if (imageCount > 50) {
    console.warn('🚨 Too many images! Showing only first 50 to prevent browser crash')
  }
  
  return safeImages
})

// Fetch images when the component is mounted - OPTIMIZED
onMounted(async () => {
  try {
    loading.value = true
    
    // Check if we're in offline mode
    if (imagesStore.offlineMode) {
      // Just load from local storage
      await imagesStore.fetchImages()
    } else {
      // Try to load from API first
      await imagesStore.fetchImages()
      
      // If no images and JSONL file is configured, offer to load it
      if (images.value.length === 0 && jsonlFilePath.value) {
        showJsonlPrompt.value = true
      }
    }
    
    // If still no images, try loading JSONL automatically
    if (images.value.length === 0 && jsonlFilePath.value) {
      await loadJsonlData()
    }
  } catch (err: any) {
    console.error('Error fetching images:', err)
    error.value = 'Failed to load images. Please try again.'
  } finally {
    loading.value = false
  }
})

// Load JSONL data
async function loadJsonlData() {
  try {
    loading.value = true
    await imagesStore.loadJsonlFile()
    showJsonlPrompt.value = false
  } catch (err: any) {
    console.error('Error loading JSONL data:', err)
    error.value = 'Failed to load JSONL data. Please try again.'
  } finally {
    loading.value = false
  }
}

// Navigate to palette page
function navigateToPalette(imageId: string) {
  router.push(`/palettes/${imageId}`)
}

// Handle image loading errors
function handleImageError(e: Event): void {
  const imgSrc = (e.target as HTMLImageElement).src;
  console.error('Image failed to load:', imgSrc);
  
  // Use a data URI for a fallback image
  (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22600%22%20viewBox%3D%220%200%20800%20600%22%3E%3Crect%20fill%3D%22%23f0f0f0%22%20width%3D%22800%22%20height%3D%22600%22%2F%3E%3Ctext%20fill%3D%22%23999999%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22400%22%20y%3D%22300%22%3EImage%20Not%20Available%3C%2Ftext%3E%3C%2Ftext%3E%3C%2Fsvg%3E'
}

// Temporary debug function to clear corrupted localStorage data
function clearData() {
  localStorage.clear()
  location.reload()
}
</script>

<style>
html, body {
  width: 100vw !important;
  min-width: 0 !important;
  max-width: 100vw !important;
  height: 100vh !important;
  min-height: 100vh !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
  background: pink !important;
}
</style>
