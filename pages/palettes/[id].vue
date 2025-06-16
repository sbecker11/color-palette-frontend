<template>
  <div>
    <!-- Loading and error states -->
    <div v-if="loading" class="flex justify-center my-8">
      <p class="text-gray-600 dark:text-gray-400">Loading palette...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg my-4">
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>
    
    <!-- Palette content -->
    <div v-else-if="palette" class="space-y-6">
      <!-- Palette header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ palette.name }}
          </h1>
        </div>
        <button 
          @click="goBack" 
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          Back
        </button>
      </div>
      
      <!-- Three-column layout -->
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Column 1: Fixed width, palette name and metadata -->
        <div class="w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div class="space-y-4">
            <!-- Editable palette name -->
            <div>
              <label for="palette-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Palette Name
              </label>
              <input 
                id="palette-name" 
                v-model="palette.name" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                @change="savePalette"
              />
            </div>
            
            <!-- Non-editable metadata -->
            <div class="space-y-2">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                <span class="font-medium">Palette ID:</span> {{ palette.id }}
              </p>
              <p v-if="palette.description" class="text-sm text-gray-800 dark:text-gray-200">
                <span class="font-medium">Description:</span> {{ palette.description }}
              </p>
              <p v-if="palette.image_id" class="text-sm text-gray-600 dark:text-gray-400">
                <span class="font-medium">Source Image:</span> 
                <button 
                  @click="goToImage" 
                  class="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Image
                </button>
              </p>
            </div>
            
            <!-- Export button -->
            <button 
              @click="exportPalette" 
              class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
              Export Palette
            </button>
          </div>
        </div>
        
        <!-- Column 2: Fixed width, color swatches -->
        <div class="w-full md:w-96 flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Colors ({{ palette.colors.length }})
          </h2>
          
          <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <div 
              v-for="color in palette.colors" 
              :key="color.id" 
              class="flex items-center bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm"
            >
              <div 
                class="w-12 h-12 rounded-md mr-4 shadow-inner" 
                :style="{ backgroundColor: color.hex }"
              ></div>
              
              <div class="flex-1">
                <p class="font-medium" v-if="color.name">{{ color.name }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ color.hex }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ color.rgb }}</p>
              </div>
              
              <div class="flex space-x-2">
                <button 
                  @click="editColor(color)" 
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Edit color"
                >
                  <span class="sr-only">Edit</span>
                  <!-- Edit icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                
                <button 
                  @click="removeColor(color.id)" 
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Remove color"
                >
                  <span class="sr-only">Remove</span>
                  <!-- Trash icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Add new color button -->
            <button 
              @click="addNewColor" 
              class="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span class="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Add New Color
              </span>
            </button>
          </div>
        </div>
        
        <!-- Column 3: Resizable, image viewer -->
        <div class="flex-grow bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Source Image
            </h2>
            <div class="flex space-x-2">
              <button 
                @click="zoomIn" 
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded"
                title="Zoom In"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
              <button 
                @click="zoomOut" 
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded"
                title="Zoom Out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
              <button 
                @click="fitImage" 
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded"
                title="Fit to Container"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="relative h-[60vh] overflow-auto bg-gray-200 dark:bg-gray-700 rounded-lg" ref="imageContainer">
            <img 
              v-if="imageUrl" 
              :src="imageUrl" 
              alt="Palette source image" 
              class="transform origin-top-left"
              ref="imageRef"
              @error="handleImageError"
              :style="{ transform: `scale(${zoomLevel})` }"
            />
            <div v-else class="flex items-center justify-center h-full">
              <p class="text-gray-500 dark:text-gray-400">No image available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- No palette found -->
    <div v-else class="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg my-4">
      <p class="text-yellow-700 dark:text-yellow-400">No palette found with the specified ID.</p>
    </div>
    
    <!-- Delete confirmation modal -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      v-model="showDeleteConfirm"
      :message="deleteConfirmMessage"
      @confirm="confirmDeleteColor"
      @cancel="showDeleteConfirm = false"
    >
      <div v-if="colorToDeleteData" class="flex items-center mb-4">
        <div 
          class="w-10 h-10 rounded-md mr-3" 
          :style="{ backgroundColor: colorToDeleteData.hex }"
        ></div>
        <div>
          <p class="font-medium" v-if="colorToDeleteData.name">{{ colorToDeleteData.name }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ colorToDeleteData.hex }}</p>
        </div>
      </div>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePaletteStore } from '~/stores/palettes'
import { storeToRefs } from 'pinia'
import type { Palette, Color } from '~/types/palette'
import ConfirmModal from '~/components/ConfirmModal.vue'

// Router and route
const route = useRoute()
const router = useRouter()

// Store
const palettesStore = usePaletteStore()
const { currentPalette } = storeToRefs(palettesStore)

// Local state
const loading = ref(false)
const error = ref<string | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const imageContainer = ref<HTMLDivElement | null>(null)
const zoomLevel = ref(1)

// Computed properties
const palette = computed(() => currentPalette.value)

// Computed property for image URL with fallback
const imageUrl = computed(() => {
  if (!palette.value) return '';
  
  // Use image_id as that's what the API returns
  if (palette.value.image_id) {
    return `/api/images/${palette.value.image_id}/file`;
  }
  
  return '';
});

// For delete color confirmation
const showDeleteConfirm = ref(false)
const colorToDelete = ref<string | null>(null)
const colorToDeleteData = ref<Color | null>(null)
const deleteConfirmMessage = computed(() => {
  return `Are you sure you want to delete this color? This action cannot be undone.`
})

// Image zoom functions
function zoomIn(): void {
  zoomLevel.value = Math.min(zoomLevel.value + 0.1, 3)
}

function zoomOut(): void {
  zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.1)
}

function fitImage(): void {
  if (!imageRef.value || !imageContainer.value) return
  
  const containerWidth = imageContainer.value.clientWidth
  const containerHeight = imageContainer.value.clientHeight
  const imageWidth = imageRef.value.naturalWidth
  const imageHeight = imageRef.value.naturalHeight
  
  // Calculate the scale to fit the image in the container
  const widthRatio = containerWidth / imageWidth
  const heightRatio = containerHeight / imageHeight
  
  // Use the smaller ratio to ensure the image fits completely
  zoomLevel.value = Math.min(widthRatio, heightRatio) * 0.9 // 90% of the container to add some padding
}

// Format date - handle missing date fields gracefully
function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (e) {
    return 'Unknown';
  }
}

// Navigation functions
function goBack(): void {
  router.back()
}

function goToImage(): void {
  if (!palette.value || !palette.value.image_id) return
  
  router.push(`/images/${palette.value.image_id}`)
}

// Color management functions
function editColor(color: Color): void {
  // Implement color editing logic
  console.log('Editing color:', color)
  // This could open a modal with color editing controls
}

function removeColor(colorId: string): void {
  colorToDelete.value = colorId
  
  // Find the color data to display in the modal
  if (palette.value) {
    colorToDeleteData.value = palette.value.colors.find(color => color.id === colorId) || null
  }
  
  showDeleteConfirm.value = true
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
    // Create a formatted JSON object with palette metadata
    const formattedExport = {
      name: palette.value.name,
      description: palette.value.description || '',
      colors: palette.value.colors.map(color => ({
        hex: color.hex,
        rgb: color.rgb,
        name: color.name || '',
        position: color.position
      }))
    }
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(formattedExport, null, 2)
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // Create and trigger download
    const a = document.createElement('a')
    a.href = url
    a.download = `${palette.value.name.replace(/\s+/g, '-').toLowerCase()}-palette.json`
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting palette:', error)
    alert('Failed to export palette. Please try again.')
  }
}

// Handle image loading errors
function handleImageError(e: Event): void {
  console.error('Image failed to load:', (e.target as HTMLImageElement).src);
  
  // Check if we're already showing the fallback to prevent infinite loops
  const currentSrc = (e.target as HTMLImageElement).src;
  if (currentSrc.includes('data:image/svg')) {
    return; // Already showing fallback, don't try again
  }
  
  // Use a data URI for a fallback image - this is guaranteed to work locally
  (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22600%22%20viewBox%3D%220%200%20800%20600%22%3E%3Crect%20fill%3D%22%23f0f0f0%22%20width%3D%22800%22%20height%3D%22600%22%2F%3E%3Ctext%20fill%3D%22%23999999%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22400%22%20y%3D%22300%22%3EImage%20Not%20Available%3C%2Ftext%3E%3C%2Fsvg%3E';
}

// Function to confirm and execute color deletion
async function confirmDeleteColor(): Promise<void> {
  if (!colorToDelete.value || !palette.value) return
  
  try {
    // Create a copy of the palette
    const updatedPalette = { ...palette.value }
    
    // Filter out the color to delete
    updatedPalette.colors = updatedPalette.colors.filter(
      color => color.id !== colorToDelete.value
    )
    
    // Reset the modal
    showDeleteConfirm.value = false
    
    // Call the store to update the palette - ensure ID is a string
    await palettesStore.updatePalette(String(updatedPalette.id), updatedPalette)
    
    // Reset the color to delete
    colorToDelete.value = null
    colorToDeleteData.value = null
  } catch (err) {
    console.error('Error deleting color:', err)
    // You could add error handling UI here
  }
}

// Fetch the palette data
async function fetchPalette(id: string): Promise<void> {
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Fetching palette with ID:', id);
    await palettesStore.getPalette(id);
    console.log('Fetch complete, palette:', currentPalette.value);
    
    // Debug the palette data
    if (currentPalette.value) {
      console.log('Palette data:', {
        id: currentPalette.value.id,
        name: currentPalette.value.name,
        description: currentPalette.value.description,
        image_id: currentPalette.value.image_id,
        colors: currentPalette.value.colors?.length || 0
      });
    }
    
    // Add this check to ensure we have data
    if (!currentPalette.value) {
      throw new Error('No palette data returned');
    }
  } catch (err: any) {
    console.error('Error loading palette:', err);
    error.value = 'Failed to load palette. Please try again.';
  } finally {
    loading.value = false;
  }
}

// Fetch data on component mount
onMounted(async () => {
  const paletteId = route.params.id?.toString();
  console.log('Component mounted, palette ID:', paletteId);
  if (paletteId) {
    await fetchPalette(paletteId);
  }
});

// Add a watcher to handle route changes
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await fetchPalette(newId.toString());
  }
});

async function savePalette() {
  if (!palette.value) return
  
  try {
    // Save the current palette - ensure ID is a string
    await palettesStore.updatePalette(String(palette.value.id), palette.value)
  } catch (error) {
    console.error('Error saving palette:', error)
  }
}
</script>
