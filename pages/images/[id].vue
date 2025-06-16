<!-- Make sure this file exists at this exact path -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <p class="text-lg">Loading image...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded">
      <p>{{ error }}</p>
      <button @click="goBack" class="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
        Go Back
      </button>
    </div>
    
    <div v-else-if="image" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">{{ image.name }}</h1>
        <div class="mb-6">
          <img :src="image.url" :alt="image.name" class="w-full h-auto rounded-lg" />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h2 class="text-lg font-semibold mb-2">Image Details</h2>
            <ul class="space-y-1 text-sm">
              <li><span class="font-medium">Dimensions:</span> {{ image.width }}x{{ image.height }}</li>
              <!-- Remove fields not in API spec -->
            </ul>
          </div>
        </div>
        
        <!-- Palettes Section -->
        <div class="mt-8">
          <h2 class="text-2xl font-bold mb-4">Color Palettes</h2>
          
          <!-- Use ClientOnly for content that might differ between server and client -->
          <ClientOnly>
            <div v-if="loadingPalettes" class="my-4">
              <p class="text-gray-600 dark:text-gray-300">Loading palettes...</p>
            </div>
            <div v-else-if="palettes.length === 0" class="my-4">
              <p class="text-gray-600 dark:text-gray-300">No palettes found for this image.</p>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Palette cards -->
              <div 
                v-for="palette in palettes" 
                :key="palette.id" 
                class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-700"
              >
                <div class="p-4">
                  <h3 class="font-medium text-lg mb-2">{{ palette.name }}</h3>
                  <p v-if="palette.description" class="text-sm text-gray-600 dark:text-gray-300 mb-2">{{ palette.description }}</p>
                  
                  <!-- Color swatches -->
                  <div class="flex h-8 rounded-md overflow-hidden mb-3">
                    <div 
                      v-for="color in palette.colors" 
                      :key="color.id" 
                      class="flex-1 h-full" 
                      :style="{ backgroundColor: color.hex }"
                      :title="color.name || color.hex"
                    ></div>
                  </div>
                  
                  <div class="flex justify-end">
                    <button 
                      @click="router.push(`/palettes/${palette.id}`)" 
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Fallback for SSR -->
            <template #fallback>
              <p class="text-gray-600 dark:text-gray-300">Loading palette data...</p>
            </template>
          </ClientOnly>
          
          <!-- Create palette button -->
          <div class="mt-6">
            <UiButton @click="createPalette" class="bg-blue-600 hover:bg-blue-700 text-white">
              Create New Palette
            </UiButton>
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button @click="goBack" class="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded">
            Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useImagesStore } from '~/stores/images'
import { usePaletteStore } from '~/stores/palettes'
import { storeToRefs } from 'pinia'
import type { Palette } from '~/types/palette'
import type { Image, ImageApiResponse } from '~/types/image'

const route = useRoute()
const router = useRouter()
const imagesStore = useImagesStore()
const palettesStore = usePaletteStore()

// Use storeToRefs to extract reactive refs from the store
// This helps avoid the "target is readonly" warnings
const { currentImage } = storeToRefs(imagesStore)
const { palettesForCurrentImage } = storeToRefs(palettesStore)

// Local reactive state
const loading = ref(true)
const error = ref<string | null>(null)
const loadingPalettes = ref(true)
const paletteError = ref<string | null>(null)

// Create a computed property for the image
const image = computed(() => {
  return currentImage.value
})

// Create a computed property for the palettes
const palettes = computed(() => {
  return palettesForCurrentImage.value || []
})

// Format file size
function formatFileSize(bytes: number): string {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format date
function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// Go back to previous page
function goBack(): void {
  router.push('/images')
}

// Create a new palette from this image
function createPalette(): void {
  // Implement palette creation logic
  console.log('Creating new palette from image:', image.value?.id)
  // Navigate to palette creation page or open modal
}

// Fetch image and palettes
async function fetchImageAndPalettes(imageId: string): Promise<void> {
  loading.value = true
  error.value = null
  loadingPalettes.value = true
  paletteError.value = null
  
  try {
    // Fetch the image
    await imagesStore.getImage(imageId)
    
    // Fetch palettes for the image
    await palettesStore.fetchPalettesByImage(imageId)
  } catch (err: any) {
    console.error('Error loading image or palettes:', err)
    error.value = 'Failed to load image or palettes. Please try again.'
  } finally {
    loading.value = false
    loadingPalettes.value = false
  }
}

// Use Nuxt's useFetch for better SSR support
const { data: imageData, pending, error: fetchError } = await useFetch<ImageApiResponse>(`/api/images/${route.params.id}`, {
  key: `image-${route.params.id}`,
  transform: (response: ImageApiResponse): ImageApiResponse => {
    if (!response) return null as unknown as ImageApiResponse;
    
    // Process the response but keep it as ImageApiResponse type
    return {
      id: response.id,
      name: response.name,
      url: response.url,
      file_path: response.file_path || '',
      width: response.width || 0,
      height: response.height || 0
    };
  }
});

// Set the image data from the fetch result
if (imageData.value) {
  // Update the store with the fetched image
  imagesStore.setCurrentImage(imageData.value)
  loading.value = false
  
  // Also fetch palettes if we have image data
  if (imageData.value.id) {
    palettesStore.fetchPalettesByImage(imageData.value.id)
      .finally(() => {
        loadingPalettes.value = false
      })
  }
} else if (fetchError.value) {
  error.value = 'Failed to load image. Please try again.'
  loading.value = false
}

// Still use onMounted as a fallback for client-side navigation
onMounted(async () => {
  // Only fetch if we don't already have the data
  if (!currentImage.value && !error.value) {
    const imageId = route.params.id?.toString()
    if (imageId) {
      await fetchImageAndPalettes(imageId)
    }
  }
})

// Set page metadata
useHead(() => ({
  title: image.value ? `${image.value.name} - Color Palette Tool` : 'Image Details - Color Palette Tool',
  meta: [
    { 
      name: 'description', 
      content: image.value 
        ? `View details and color palettes for ${image.value.name}` 
        : 'View image details and associated color palettes'
    }
  ]
}))
</script>
