<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <p class="text-gray-600 dark:text-gray-300">Loading palette...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="palette" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Debug info -->
      <div class="lg:col-span-12 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
        <h3 class="font-bold mb-2">Debug Info:</h3>
        <pre class="text-xs overflow-auto">{{ JSON.stringify(palette, null, 2) }}</pre>
      </div>
      
      <!-- Column 1: Palette Metadata (fixed width) -->
      <div class="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h1 class="text-2xl font-bold mb-4">{{ palette.name }}</h1>
        
        <div class="mb-4">
          <p v-if="palette.description" class="text-gray-600 dark:text-gray-300 mb-2">{{ palette.description }}</p>
          
          <div class="text-sm space-y-2">
            <p><span class="font-medium">Created:</span> {{ formatDate(palette.createdAt) }}</p>
            <p><span class="font-medium">Updated:</span> {{ formatDate(palette.updatedAt) }}</p>
            <p><span class="font-medium">Colors:</span> {{ palette.colors.length }}</p>
          </div>
        </div>
        
        <div class="mt-6 space-y-3">
          <UiButton 
            class="w-full bg-blue-600 hover:bg-blue-700 text-white"
            @click="exportPalette"
          >
            Export Palette
          </UiButton>
          
          <UiButton 
            class="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
            @click="goToImage"
          >
            View Source Image
          </UiButton>
        </div>
      </div>
      
      <!-- Column 2: Color Swatches Management (fixed width) -->
      <div class="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 class="text-xl font-semibold mb-4">Color Swatches</h2>
        
        <div class="space-y-4">
          <div 
            v-for="color in palette.colors" 
            :key="color.id" 
            class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-3 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center space-x-3">
              <div 
                class="w-10 h-10 rounded-md" 
                :style="{ backgroundColor: color.hex }"
              ></div>
              
              <div class="flex-1">
                <p class="font-medium">{{ color.name || 'Unnamed Color' }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ color.hex }}</p>
                <p v-if="color.rgb" class="text-xs text-gray-500 dark:text-gray-400">{{ color.rgb }}</p>
              </div>
              
              <div class="flex space-x-2">
                <button 
                  @click="editColor(color)"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  title="Edit color"
                >
                  <span class="sr-only">Edit</span>
                  ✏️
                </button>
                
                <button 
                  @click="removeColor(color.id)"
                  class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  title="Remove color"
                >
                  <span class="sr-only">Remove</span>
                  🗑️
                </button>
              </div>
            </div>
          </div>
          
          <UiButton 
            class="w-full bg-green-600 hover:bg-green-700 text-white"
            @click="addNewColor"
          >
            Add New Color
          </UiButton>
        </div>
      </div>
      
      <!-- Column 3: Image (resizable) -->
      <div class="lg:col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 class="text-xl font-semibold mb-4">Source Image</h2>
        
        <div v-if="palette && palette.imageId" class="relative">
          <!-- Use a computed property for the image URL with fallback -->
          <img 
            :src="imageUrl" 
            :alt="palette.name" 
            class="w-full h-auto rounded-md cursor-crosshair"
            @click="pickColorFromImage"
            ref="imageRef"
            @error="handleImageError"
          />
          
          <div class="mt-3 text-sm text-gray-600 dark:text-gray-300">
            <p>Click on the image to sample colors</p>
            <p class="text-xs mt-1">Image URL: {{ imageUrl }}</p>
          </div>
        </div>
        
        <div v-else class="bg-gray-100 dark:bg-gray-700 rounded-md p-6 text-center">
          <p class="text-gray-600 dark:text-gray-300">
            No source image available
          </p>
          <p v-if="palette" class="text-xs mt-2 text-gray-500">
            Debug info: imageUrl={{ palette.imageUrl }}, imageId={{ palette.imageId }}
          </p>
        </div>
      </div>
    </div>
    
    <div class="mt-6">
      <UiButton 
        class="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white"
        @click="goBack"
      >
        Back
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePalettesStore } from '~/stores/palettes'
import { storeToRefs } from 'pinia'
import type { Palette, Color } from '~/types/palette'

const route = useRoute()
const router = useRouter()
const palettesStore = usePalettesStore()
const { currentPalette } = storeToRefs(palettesStore)

const loading = ref(true)
const error = ref<string | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)

// Get the palette from the store or fetch it
const palette = computed(() => {
  // Add more detailed logging
  console.log('Current palette:', currentPalette.value)
  if (currentPalette.value) {
    console.log('Image URL:', currentPalette.value.imageUrl)
    console.log('Image ID:', currentPalette.value.imageId)
    console.log('All palette properties:', Object.keys(currentPalette.value))
  }
  return currentPalette.value
})

// Add a watch to log when the palette changes
watch(palette, (newValue) => {
  console.log('Palette changed:', newValue)
  if (newValue) {
    console.log('New image URL:', newValue.imageUrl)
  }
}, { immediate: true })

// Format date
function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  } catch (e) {
    console.error('Error formatting date:', e)
    return 'Invalid date'
  }
}

// Navigation functions
function goBack(): void {
  router.back()
}

function goToImage(): void {
  if (!palette.value || !palette.value.imageId) return
  
  router.push(`/images/${palette.value.imageId}`)
}

// Color management functions
function editColor(color: Color): void {
  // Implement color editing logic
  console.log('Editing color:', color)
  // This could open a modal with color editing controls
}

function removeColor(colorId: string): void {
  // Implement color removal logic
  console.log('Removing color:', colorId)
  // This would call a store action to remove the color
}

function addNewColor(): void {
  // Implement adding new color logic
  console.log('Adding new color')
  // This could open a color picker or modal
}

// Export palette function
async function exportPalette(): Promise<void> {
  if (!palette.value) return
  
  try {
    // Fetch the export data from the API
    const response = await fetch(`/api/palettes/${palette.value.id}/export`)
    
    if (!response.ok) {
      throw new Error(`Failed to export palette: ${response.status}`)
    }
    
    const exportData = await response.json()
    
    // Create a formatted JSON object with palette metadata
    const formattedExport = {
      name: palette.value.name,
      description: palette.value.description || '',
      colors: exportData.map((color: any) => ({
        hex: color.hex,
        rgb: `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`,
        hsv: color.hsv ? `hsv(${color.hsv[0]}, ${color.hsv[1]}%, ${color.hsv[2]}%)` : undefined,
        position: color.position
      }))
    }
    
    // Convert to JSON string
    const jsonString = JSON.stringify(formattedExport, null, 2)
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // Create and trigger download
    const a = document.createElement('a')
    a.href = url
    a.download = `${palette.value.name.replace(/\s+/g, '-').toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting palette:', error)
    // You could add error handling UI here
  }
}

// Image color picking function
function pickColorFromImage(event: MouseEvent): void {
  if (!imageRef.value || !palette.value) return
  
  const img = imageRef.value
  const rect = img.getBoundingClientRect()
  
  // Calculate click position relative to image
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Calculate the position as a percentage of image dimensions
  const xPercent = x / rect.width
  const yPercent = y / rect.height
  
  console.log(`Clicked at position: ${xPercent.toFixed(2)}%, ${yPercent.toFixed(2)}%`)
  
  // Create a canvas to sample the color
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return
  
  // Set canvas dimensions to match image
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  
  // Draw the image on the canvas
  context.drawImage(img, 0, 0, canvas.width, canvas.height)
  
  // Calculate the pixel coordinates on the original image
  const pixelX = Math.floor(xPercent * canvas.width)
  const pixelY = Math.floor(yPercent * canvas.height)
  
  // Get the pixel data
  try {
    const pixelData = context.getImageData(pixelX, pixelY, 1, 1).data
    const r = pixelData[0]
    const g = pixelData[1]
    const b = pixelData[2]
    
    // Convert to hex
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
    
    console.log(`Sampled color: RGB(${r}, ${g}, ${b}) / ${hex}`)
    
    // Add the color to the palette (you'll need to implement this)
    addColorToPalette({
      hex,
      rgb: [r, g, b],
      position: palette.value.colors.length
    })
  } catch (error) {
    console.error('Error sampling color:', error)
    // This might happen due to CORS issues with the image
    alert('Unable to sample color from this image due to security restrictions.')
  }
}

// Add a new color to the palette
function addColorToPalette(colorData: { hex: string, rgb: number[], position: number }): void {
  // This is a placeholder - you'll need to implement the actual API call
  console.log('Adding color to palette:', colorData)
  
  // For now, just show a notification
  alert(`Color ${colorData.hex} sampled! Implement API call to add to palette.`)
  
  // In a real implementation, you would:
  // 1. Call an API to add the color to the palette
  // 2. Update the local state
  // 3. Show a success message
}

// Fetch the palette data
async function fetchPalette(id: string): Promise<void> {
  loading.value = true
  error.value = null
  
  try {
    console.log('Fetching palette with ID:', id)
    await palettesStore.getPalette(id)
    console.log('Fetch complete, palette:', currentPalette.value)
  } catch (err: any) {
    console.error('Error loading palette:', err)
    error.value = 'Failed to load palette. Please try again.'
  } finally {
    loading.value = false
  }
}

// Fetch data on component mount
onMounted(async () => {
  const paletteId = route.params.id?.toString()
  console.log('Component mounted, palette ID:', paletteId)
  if (paletteId) {
    await fetchPalette(paletteId)
  }
})

// Set page metadata
useHead(() => ({
  title: palette.value ? `${palette.value.name} - Color Palette Tool` : 'Palette Details - Color Palette Tool',
  meta: [
    { 
      name: 'description', 
      content: palette.value 
        ? `View and edit the ${palette.value.name} color palette` 
        : 'View and edit color palette details'
    }
  ]
}))

// Computed property for image URL with fallback
const imageUrl = computed(() => {
  if (!palette.value) return '';
  
  // If imageUrl is provided and not empty, use it
  if (palette.value.imageUrl && palette.value.imageUrl.trim() !== '') {
    return palette.value.imageUrl;
  }
  
  // Otherwise, construct a URL from the imageId
  if (palette.value.imageId) {
    return `/api/images/${palette.value.imageId}/file`;
  }
  
  // Fallback to a placeholder
  return 'https://via.placeholder.com/800x600?text=No+Image';
});

// Handle image loading errors
function handleImageError(e: Event): void {
  console.error('Image failed to load:', (e.target as HTMLImageElement).src);
  
  // Set a fallback image
  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
}
</script>
