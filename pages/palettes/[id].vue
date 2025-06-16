<template>
  <div class="palette-detail-container">
    <!-- Loading and error states -->
    <div v-if="loading" class="flex justify-center my-8">
      <p class="text-gray-600 dark:text-gray-400">Loading palette...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg my-4">
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>
    
    <!-- Palette content -->
    <div v-else-if="palette" class="palette-content">
      <!-- Three-column layout with 10px gaps -->
      <div class="flex flex-col md:flex-row space-x-0 md:space-x-[10px] space-y-[10px] md:space-y-0 relative w-full h-full bg-gray-100 dark:bg-gray-900 pt-[10px] px-[10px]" ref="columnsContainer">
        <!-- Column 1: Fixed width, palette name and metadata -->
        <div class="w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-none h-full overflow-auto">
          <div class="space-y-4">
            <!-- Editable palette name -->
            <div>
              <label for="palette-name" class="block text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
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
            
            <!-- Navigation and export buttons -->
            <div class="space-y-2">
              <button 
                @click="goBack" 
                class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
              >
                Back
              </button>
              
              <button 
                @click="exportPalette" 
                class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                Export Palette
              </button>
            </div>
          </div>
        </div>
        
        <!-- Column 2: Fixed width, color swatches -->
        <div class="w-full md:w-96 flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-none h-full overflow-auto">
          <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Colors ({{ palette.colors.length }})
          </h2>
          
          <!-- Scrollable color list -->
          <div class="space-y-3 h-[calc(100%-7rem)] overflow-y-auto pr-2 mb-3">
            <div 
              v-for="color in palette.colors" 
              :key="color.id" 
              class="flex items-center bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm"
            >
              <div 
                class="w-12 h-12 rounded-md mr-4 shadow-inner cursor-pointer relative"
                :style="{ backgroundColor: color.hex }"
                @click="toggleColorSelection(color.id)"
              >
                <!-- Interior white border for selected color -->
                <div 
                  v-if="selectedColorId === color.id" 
                  class="absolute inset-0 rounded-md border border-white pointer-events-none"
                ></div>
              </div>
              
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
          </div>
          
          <!-- Add new color button - now outside the scrollable container -->
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
        
        <!-- Column 3: Resizable, image viewer -->
        <div 
          class="w-full md:flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-none h-full overflow-auto"
          ref="imageColumnRef"
        >
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
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
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
                title="Zoom to Fit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
              <button 
                @click="fillImage" 
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded"
                title="Zoom to Fill"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clip-rule="evenodd" />
                </svg>
              </button>
              <button 
                @click="togglePanMode" 
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded"
                :class="{ 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400': isPanModeActive }"
                title="Pan Mode"
              >
                <!-- Dark mode icon -->
                <img 
                  v-if="isDarkMode" 
                  src="/icons/pan-32-white.png" 
                  alt="Pan" 
                  class="h-5 w-5 object-contain" 
                />
                <!-- Light mode icon -->
                <img 
                  v-else
                  src="/icons/pan-32-black.png" 
                  alt="Pan" 
                  class="h-5 w-5 object-contain" 
                />
              </button>
            </div>
          </div>
          
          <div 
            class="relative h-[calc(100%-60px)] overflow-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex justify-center items-center" 
            ref="imageContainer"
            @mouseenter="showColorSelector = true"
            @mouseleave="showColorSelector = false"
            @mousemove="updateColorSelectorPosition"
            @click="handleImageClick"
          >
            <img 
              v-if="imageUrl" 
              :src="imageUrl" 
              alt="Palette source image" 
              class="transform max-w-none pixel-perfect"
              ref="imageRef"
              @error="handleImageError"
              :style="{ transform: `scale(${zoomLevel})` }"
            />
            <div v-else class="flex items-center justify-center h-full">
              <p class="text-gray-500 dark:text-gray-400">No image available</p>
            </div>
            
            <!-- Color selector overlay -->
            <div 
              v-if="showColorSelector && imageUrl" 
              class="absolute pointer-events-none border border-white"
              :style="{
                width: '32px',
                height: '32px',
                left: `${colorSelectorPosition.x - 16}px`,
                top: `${colorSelectorPosition.y - 16}px`,
                backgroundColor: 'transparent',
                boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5)',
                zIndex: 10
              }"
            ></div>
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
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue'
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
const columnsContainer = ref<HTMLDivElement | null>(null)
const imageColumnRef = ref<HTMLDivElement | null>(null)
const zoomLevel = ref(1)
const imageColumnWidth = ref(0)
const rightMargin = ref(40) // Constant distance from right edge in pixels
const bottomMargin = ref(40) // Constant distance from bottom edge in pixels
const isDraggingImage = ref(false)
const isPanModeActive = ref(false)
const lastMousePosition = ref({ x: 0, y: 0 })
const imagePosition = ref({ x: 0, y: 0 })
const showColorSelector = ref(false)
const colorSelectorPosition = ref({ x: 0, y: 0 })
const selectedColorId = ref<string | null>(null)
const sampledColor = ref<string>('')
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Dark mode detection
const isDarkMode = ref(false)

// Function to check dark mode
function checkDarkMode() {
  isDarkMode.value = document.documentElement.classList.contains('dark')
}

// Image pan/move functions
function togglePanMode(): void {
  isPanModeActive.value = !isPanModeActive.value
  
  // Reset position when turning off pan mode
  if (!isPanModeActive.value) {
    imagePosition.value = { x: 0, y: 0 }
    if (imageRef.value) {
      imageRef.value.style.transform = `scale(${zoomLevel.value})`
    }
  }
}

function startImageDrag(e: MouseEvent): void {
  if (!isPanModeActive.value) return
  
  isDraggingImage.value = true
  lastMousePosition.value = { x: e.clientX, y: e.clientY }
}

function dragImage(e: MouseEvent): void {
  if (!isDraggingImage.value) return
  
  const deltaX = e.clientX - lastMousePosition.value.x
  const deltaY = e.clientY - lastMousePosition.value.y
  
  imagePosition.value = {
    x: imagePosition.value.x + deltaX,
    y: imagePosition.value.y + deltaY
  }
  
  lastMousePosition.value = { x: e.clientX, y: e.clientY }
  
  if (imageRef.value) {
    imageRef.value.style.transform = `translate(${imagePosition.value.x}px, ${imagePosition.value.y}px) scale(${zoomLevel.value})`
  }
}

function stopImageDrag(): void {
  isDraggingImage.value = false
}

// Modified zoom functions to use integer scaling for clearer pixels
function zoomIn(): void {
  // Use larger steps for more noticeable pixel boundaries
  zoomLevel.value = Math.ceil(zoomLevel.value * 1.5)
  updateImageTransform()
}

function zoomOut(): void {
  // Use integer division for clearer pixels when zooming out
  zoomLevel.value = Math.max(Math.floor(zoomLevel.value / 1.5), 1)
  updateImageTransform()
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
  
  // Reset position when fitting image
  imagePosition.value = { x: 0, y: 0 }
  updateImageTransform()
}

function fillImage(): void {
  if (!imageRef.value || !imageContainer.value) return
  
  const containerWidth = imageContainer.value.clientWidth
  const containerHeight = imageContainer.value.clientHeight
  const imageWidth = imageRef.value.naturalWidth
  const imageHeight = imageRef.value.naturalHeight
  
  // Calculate the scale to fill the container
  const widthRatio = containerWidth / imageWidth
  const heightRatio = containerHeight / imageHeight
  
  // Use the larger ratio to ensure the image fills the container
  zoomLevel.value = Math.max(widthRatio, heightRatio)
  
  // Reset position when filling image
  imagePosition.value = { x: 0, y: 0 }
  updateImageTransform()
}

function updateImageTransform(): void {
  if (imageRef.value) {
    // Round zoom level to nearest integer if it's above 1 for sharper pixels
    const displayZoom = zoomLevel.value > 1 ? Math.round(zoomLevel.value) : zoomLevel.value
    
    if (isPanModeActive.value) {
      imageRef.value.style.transform = `translate(${imagePosition.value.x}px, ${imagePosition.value.y}px) scale(${displayZoom})`
    } else {
      imageRef.value.style.transform = `scale(${displayZoom})`
    }
  }
}

// Set up event listeners and initialize
onMounted(() => {
  // Set up dark mode detection
  checkDarkMode()
  const observer = new MutationObserver(checkDarkMode)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  
  // Set up image drag event listeners
  document.addEventListener('mousemove', dragImage)
  document.addEventListener('mouseup', stopImageDrag)
  
  // Fetch palette data and set up resize listener
  const paletteId = route.params.id?.toString();
  console.log('Component mounted, palette ID:', paletteId);
  if (paletteId) {
    fetchPalette(paletteId);
    // Set up resize listener after data is loaded
    setupResizeListener();
  }
})

// Clean up event listeners
onUnmounted(() => {
  // Clean up dark mode observer
  document.querySelectorAll('*').forEach(el => {
    const observer = new MutationObserver(() => {});
    observer.disconnect();
  });
  
  // Clean up image drag event listeners
  document.removeEventListener('mousemove', dragImage)
  document.removeEventListener('mouseup', stopImageDrag)
  
  // Clean up resize listener
  window.removeEventListener('resize', updateImageColumnWidth);
})

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

// Function to update the image column width based on window size
function updateImageColumnWidth() {
  if (!columnsContainer.value || !imageColumnRef.value) return;
  
  // Get the container's left position and width
  const containerRect = columnsContainer.value.getBoundingClientRect();
  const containerLeft = containerRect.left;
  const containerWidth = containerRect.width;
  
  // Calculate the width of the first two columns plus gaps
  const fixedColumnsWidth = 64 + 96 + 12; // 64px (col1) + 96px (col2) + 12px (2 gaps)
  
  // Calculate the available width for the third column
  const availableWidth = window.innerWidth - containerLeft - rightMargin.value - fixedColumnsWidth;
  
  // Set the image column width
  imageColumnWidth.value = Math.max(300, availableWidth); // Minimum width of 300px
}

// Add resize event listener
function setupResizeListener() {
  window.addEventListener('resize', updateImageColumnWidth);
  updateImageColumnWidth(); // Initial calculation
}

// Remove resize event listener on component unmount
onUnmounted(() => {
  window.removeEventListener('resize', updateImageColumnWidth);
});

// For delete color confirmation
const showDeleteConfirm = ref(false)
const colorToDelete = ref<string | null>(null)
const colorToDeleteData = ref<Color | null>(null)
const deleteConfirmMessage = computed(() => {
  return `Are you sure you want to delete this color? This action cannot be undone.`
})

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
    // Set up resize listener after data is loaded
    setupResizeListener();
    
    // We'll let the image onload handler take care of fitting the image
    // This ensures consistent behavior between initial load and manual clicks
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

// Improved image loading and zoom handling
function handleImageLoaded() {
  console.log('Image loaded, applying zoom-to-fit');
  // Use a short delay to ensure dimensions are calculated correctly
  setTimeout(() => {
    fitImage();
    console.log('Zoom level after fit:', zoomLevel.value);
  }, 50);
}

// Watch for image URL changes to apply zoom-to-fit when image loads
watch(imageUrl, (newUrl) => {
  if (newUrl) {
    console.log('Image URL changed, waiting for load');
    // Reset zoom level to ensure consistent behavior
    zoomLevel.value = 1;
  }
});

// Watch for the image element to be created
watch(imageRef, (newRef) => {
  if (newRef) {
    console.log('Image ref created, setting onload handler');
    // Remove any existing handlers to prevent duplicates
    if (newRef.onload) newRef.onload = null;
    
    // Add an onload event handler to the image
    newRef.onload = handleImageLoaded;
    
    // If the image is already loaded, call the handler directly
    if (newRef.complete) {
      console.log('Image already loaded, calling handler directly');
      handleImageLoaded();
    }
  }
});

// Add this function to update the color selector position
function updateColorSelectorPosition(e: MouseEvent) {
  if (!imageContainer.value) return
  
  const rect = imageContainer.value.getBoundingClientRect()
  colorSelectorPosition.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
  
  // Sample the color if the image is loaded
  if (imageRef.value && imageRef.value.complete) {
    sampledColor.value = getColorAtPosition() || ''
  }
}

// Add a function to get the color at the current position (optional)
function getColorAtPosition(): string | null {
  if (!imageRef.value || !imageContainer.value) return null
  
  try {
    // Create canvas if it doesn't exist
    if (!canvasRef.value) {
      canvasRef.value = document.createElement('canvas')
    }
    
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    
    // Set canvas size to match image
    canvas.width = imageRef.value.naturalWidth
    canvas.height = imageRef.value.naturalHeight
    
    // Draw image to canvas
    ctx.drawImage(imageRef.value, 0, 0)
    
    // Calculate the position in the original image coordinates
    const scaleX = imageRef.value.naturalWidth / imageRef.value.width
    const scaleY = imageRef.value.naturalHeight / imageRef.value.height
    
    // Adjust for zoom level
    const x = Math.floor((colorSelectorPosition.value.x / zoomLevel.value) * scaleX)
    const y = Math.floor((colorSelectorPosition.value.y / zoomLevel.value) * scaleY)
    
    // Get pixel data
    const pixel = ctx.getImageData(x, y, 1, 1).data
    
    // Convert to hex
    const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`
    
    return hex
  } catch (error) {
    console.error('Error sampling color:', error)
    return null
  }
}

// Function to toggle color selection
function toggleColorSelection(colorId: string): void {
  if (selectedColorId.value === colorId) {
    // If already selected, unselect it
    selectedColorId.value = null
  } else {
    // Otherwise, select it
    selectedColorId.value = colorId
  }
}

// Function to add the sampled color to the palette
function addSampledColor() {
  if (!sampledColor.value || !palette.value) return
  
  // If a color is selected, update that color instead of adding a new one
  if (selectedColorId.value) {
    // Find the selected color
    const colorIndex = palette.value.colors.findIndex(c => c.id === selectedColorId.value)
    
    if (colorIndex !== -1) {
      // Create a copy of the palette
      const updatedPalette = { ...palette.value }
      
      // Update the color
      updatedPalette.colors = [...updatedPalette.colors]
      updatedPalette.colors[colorIndex] = {
        ...updatedPalette.colors[colorIndex],
        hex: sampledColor.value,
        rgb: hexToRgb(sampledColor.value)
      }
      
      // Save the updated palette
      palettesStore.updatePalette(String(updatedPalette.id), updatedPalette)
      
      // Unselect the color
      selectedColorId.value = null
      
      return
    }
  }
  
  // If no color is selected or the selected color wasn't found,
  // add a new color to the palette
  const newColor = {
    id: `color-${Date.now()}`,
    hex: sampledColor.value,
    rgb: hexToRgb(sampledColor.value),
    name: '',
    position: palette.value.colors.length
  }
  
  // Create a copy of the palette
  const updatedPalette = { ...palette.value }
  
  // Add the new color
  updatedPalette.colors = [...updatedPalette.colors, newColor]
  
  // Save the updated palette
  palettesStore.updatePalette(String(updatedPalette.id), updatedPalette)
}

// Helper function to convert hex to rgb
function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '')
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Return the RGB string
  return `rgb(${r}, ${g}, ${b})`
}

// Add click handler to the image container
function handleImageClick(e: MouseEvent) {
  if (showColorSelector.value && sampledColor.value) {
    addSampledColor()
  }
}
</script>

<style scoped>
/* Add stronger pixel rendering settings */
.pixel-perfect {
  image-rendering: optimizeSpeed;             /* Older versions of FF */
  image-rendering: -moz-crisp-edges;          /* FF 6.0+ */
  image-rendering: -webkit-optimize-contrast; /* Safari */
  image-rendering: -o-crisp-edges;            /* Opera */
  image-rendering: pixelated;                 /* Modern browsers */
  image-rendering: crisp-edges;               /* Safari and Edge */
  -ms-interpolation-mode: nearest-neighbor;   /* IE */
  
  /* Ensure transform uses nearest-neighbor */
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform;
}

.palette-detail-container {
  position: fixed;
  top: 63px; /* Increased from 60px to 63px to avoid navbar overlap */
  left: 30px;
  right: 30px;
  bottom: 30px;
  overflow: hidden;
  background-color: var(--bg-color, #f9fafb);
  border-radius: 0; /* Removed border-radius */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* Make palette content take full height */
.palette-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
}

/* Ensure the columns container takes remaining height */
.palette-content > div:last-child {
  flex-grow: 1;
  min-height: 0; /* Important for flex children to respect parent height */
}

/* Ensure the third column takes all remaining space */
@media (min-width: 768px) {
  .palette-content [ref="columnsContainer"] > div:nth-child(3) {
    width: calc(100% - 64px - 96px - 12px) !important;
    flex: 1 1 auto !important;
  }
}

/* Dark mode support */
:root {
  --bg-color: white;
}

.dark {
  --bg-color: #1f2937; /* dark:bg-gray-800 */
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .palette-detail-container {
    position: relative;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: auto;
    margin: 30px;
    overflow: auto;
  }
  
  .palette-content [ref="columnsContainer"] {
    height: auto !important;
  }
  
  .palette-content [ref="columnsContainer"] > div {
    height: auto !important;
    max-height: none !important;
  }
}
</style>
