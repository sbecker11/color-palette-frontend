<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Image Details</h1>
      <UiButton 
        @click="router.push('/images')" 
        variant="secondary"
      >
        Back to Images
      </UiButton>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <p class="text-xl">Loading image details...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>{{ error }}</p>
    </div>
    
    <!-- Image details -->
    <div v-else-if="image" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Image preview -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="max-h-[600px] overflow-auto">
          <img 
            :src="image.url" 
            :alt="image.name || 'Image'" 
            class="w-full h-auto"
          />
        </div>
      </div>
      
      <!-- Image metadata -->
      <div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold mb-4">{{ image.name }}</h2>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-lg font-medium mb-2">Image Information</h3>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="text-gray-600">Uploaded:</div>
                <div>{{ formatDate(image.createdAt) }}</div>
                
                <div class="text-gray-600">Dimensions:</div>
                <div>{{ image.width || 'Unknown' }} × {{ image.height || 'Unknown' }}</div>
                
                <div class="text-gray-600">File size:</div>
                <div>{{ formatFileSize(image.fileSize) }}</div>
                
                <div class="text-gray-600">File type:</div>
                <div>{{ image.fileType || 'Unknown' }}</div>
              </div>
            </div>
            
            <!-- Color palette preview -->
            <div v-if="image.colors && image.colors.length">
              <h3 class="text-lg font-medium mb-2">Color Preview</h3>
              <div class="flex flex-wrap gap-2">
                <div 
                  v-for="color in image.colors" 
                  :key="color.hex"
                  class="w-10 h-10 rounded shadow"
                  :style="{ backgroundColor: color.hex }"
                  :title="`${color.name}: ${color.hex}`"
                ></div>
              </div>
            </div>
            
            <!-- Palettes section -->
            <div>
              <h3 class="text-lg font-medium mb-2">Color Palettes</h3>
              
              <!-- Palettes dropdown -->
              <div v-if="palettes.length" class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Select a palette
                </label>
                <div class="flex space-x-2">
                  <select 
                    v-model="selectedPaletteId"
                    class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select a palette --</option>
                    <option 
                      v-for="palette in palettes" 
                      :key="palette.id" 
                      :value="palette.id"
                    >
                      {{ palette.name }}
                    </option>
                  </select>
                  
                  <UiButton 
                    variant="secondary"
                    :disabled="!selectedPaletteId"
                    @click="viewPalette"
                  >
                    View
                  </UiButton>
                </div>
              </div>
              
              <!-- No palettes message -->
              <p v-else class="text-gray-600 mb-4">
                No palettes created for this image yet.
              </p>
              
              <!-- Create new palette button -->
              <UiButton 
                variant="primary"
                @click="createNewPalette"
              >
                Create New Palette
              </UiButton>
            </div>
            
            <!-- Actions -->
            <div class="flex justify-between pt-4 border-t border-gray-200">
              <UiButton 
                variant="danger"
                @click="showDeleteConfirm = true"
              >
                Delete Image
              </UiButton>
              
              <UiButton 
                variant="primary"
                @click="downloadImage"
              >
                Download Image
              </UiButton>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Not found state -->
    <div v-else class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
      <p>Image not found</p>
    </div>
    
    <!-- Delete confirmation modal -->
    <UiModal v-if="showDeleteConfirm" @close="showDeleteConfirm = false">
      <div class="p-6">
        <h3 class="text-lg font-medium mb-4">Confirm Delete</h3>
        <p class="mb-6">Are you sure you want to delete this image? This action cannot be undone.</p>
        <div class="flex justify-end space-x-3">
          <UiButton variant="secondary" @click="showDeleteConfirm = false">
            Cancel
          </UiButton>
          <UiButton variant="danger" @click="confirmDelete">
            Delete
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { useImagesStore } from '~/stores/images'
import { usePalettesStore } from '~/stores/palettes'
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { saveAs } from 'file-saver'
import type { Palette } from '~/types/palette'

const router = useRouter()
const route = useRoute()
const imagesStore = useImagesStore()
const palettesStore = usePalettesStore()

const image = ref(null)
const loading = ref(true)
const error = ref(null)
const showDeleteConfirm = ref(false)
const palettes = ref<Palette[]>([])
const selectedPaletteId = ref('')

onMounted(async () => {
  try {
    const imageId = route.params.id as string
    const fetchedImage = await imagesStore.getImage(imageId)
    image.value = fetchedImage
    
    // Fetch palettes for this image
    if (palettesStore.fetchPalettesByImage) {
      const paletteData = await palettesStore.fetchPalettesByImage(imageId)
      // Ensure we have an array of palettes and they match the Palette type
      palettes.value = Array.isArray(paletteData) ? paletteData as Palette[] : []
    }
  } catch (err) {
    error.value = 'Failed to load image details'
    console.error(err)
  } finally {
    loading.value = false
  }
})

function formatDate(dateString) {
  if (!dateString) return 'Unknown'
  
  try {
    const date = new Date(dateString)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date format'
    }
    return date.toLocaleDateString()
  } catch (e) {
    console.error('Error formatting date:', e, dateString)
    return 'Invalid date format'
  }
}

function formatFileSize(bytes) {
  if (!bytes) return 'Unknown'
  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

function downloadImage() {
  if (!image.value) return
  
  // Extract filename from URL or use image ID
  const filename = image.value.name || `image-${image.value.id}.jpg`
  
  // Use FileSaver.js to download the image
  saveAs(image.value.url, filename)
}

async function confirmDelete() {
  if (!image.value) return
  
  try {
    await imagesStore.deleteImage(image.value.id)
    router.push('/images')
  } catch (err) {
    error.value = 'Failed to delete image'
    console.error(err)
  } finally {
    showDeleteConfirm.value = false
  }
}

function viewPalette() {
  if (!selectedPaletteId.value) return
  router.push(`/palettes/${selectedPaletteId.value}`)
}

async function createNewPalette() {
  if (!image.value) return
  
  try {
    // Create a new palette with k-means clustering
    const newPalette = await palettesStore.createPalette({
      name: `Palette for ${image.value.name}`,
      imageId: image.value.id,
      useKMeans: true,
      colorsCount: 6 // Default number of colors to extract
    })
    
    // Navigate to the palette detail page
    router.push(`/palettes/${newPalette.id}`)
  } catch (err) {
    error.value = 'Failed to create palette'
    console.error(err)
  }
}
</script>
