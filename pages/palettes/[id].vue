<template>
  <div class="palette-detail-container" style="cursor: default !important;">
    <!-- Loading and error states -->
    <div v-if="loading" class="flex justify-center my-8">
      <p class="text-gray-600 dark:text-gray-400">Loading palette...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg my-4">
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>
    
    <!-- Palette content -->
    <div v-else-if="palette && imageData" class="palette-content">
      <!-- Show a message if color sampling is blocked for this image -->
      <div v-if="samplingBlocked" class="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded mb-4 text-yellow-800 dark:text-yellow-300">
        Color sampling is not available for this image due to browser security restrictions (CORS).
      </div>
      <!-- Three-column layout with 10px gaps -->
      <div class="flex flex-col md:flex-row space-x-0 md:space-x-[10px] space-y-[10px] md:space-y-0 relative w-full h-full bg-gray-100 dark:bg-gray-900 pt-[10px]" ref="columnsContainer">
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
                v-model="palette.paletteName" 
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
            </div>
            
            <!-- Navigation and export buttons -->
            <div class="space-y-2">
              <button 
                @click="goBack" 
                class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
                title="Back - Return to the previous page or palette list"
              >
                Back
              </button>
              
              <button 
                @click="exportPalette" 
                class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                title="Export Palette - Download the palette as a JSON file to save or share"
              >
                Export Palette
              </button>
            </div>
          </div>
        </div>
        
        <!-- Column 2: Fixed width, color swatches -->
        <div class="w-full md:w-96 flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-none h-full overflow-auto">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Colors ({{ palette.colorPalette.length }})
            </h2>
            
            <!-- Edit Mode / Serial Mode toggle button removed since Add New Colors button serves the same purpose -->
          </div>
          
          <!-- Scrollable color list -->
          <div class="space-y-3 h-[calc(100%-7rem)] overflow-y-auto pr-2 mb-3" ref="colorListRef">
            <div 
              v-for="color in palette.colorPalette" 
              :key="typeof color === 'object' && color !== null && 'id' in color ? color.id : String(color)"
              :data-color-id="typeof color === 'object' && color !== null && 'id' in color ? color.id : String(color)"
              class="flex items-center bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm"
            >
              <div 
                class="w-12 h-12 rounded-md mr-4 shadow-inner cursor-pointer relative"
                :style="{ backgroundColor: typeof color === 'string' ? color : color.hex, border: (samplingState.selectedColorId === (typeof color === 'object' && color !== null && 'id' in color ? color.id : '')) ? '2px solid #2563eb' : '1px solid #e5e7eb' }"
                @click="typeof color === 'object' && color !== null && 'id' in color ? toggleColorSelection(color.id) : undefined"
              >
                <!-- Interior white border for selected color -->
                <div 
                  v-if="typeof color === 'object' && color !== null && 'id' in color && samplingState.selectedColorId === color.id" 
                  class="absolute inset-0 rounded-md border-2 border-blue-500 pointer-events-none"
                ></div>
              </div>
              
              <div class="flex-1">
                <!-- Display color name if available -->
                <p class="font-medium" v-if="typeof color === 'object' && color !== null && 'name' in color">{{ color.name }}</p>
                
                <!-- Always display hex value -->
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ typeof color === 'string' ? color : (color.hex || color) }}
                </p>
                
                <!-- Display RGB value if available -->
                <p class="text-sm text-gray-600 dark:text-gray-400" v-if="typeof color === 'object' && color !== null && 'rgb' in color">
                  {{ Array.isArray(color.rgb) ? `RGB(${color.rgb.join(', ')})` : color.rgb }}
                </p>
              </div>
              
              <div class="flex space-x-2">
                <button 
                  @click="typeof color === 'object' && color !== null ? editColor(color) : undefined" 
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Edit color - Open color editor to modify this color's properties"
                  :disabled="typeof color !== 'object' || color === null"
                >
                  <span class="sr-only">Edit</span>
                  <!-- Edit icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                
                <button 
                  @click="typeof color === 'object' && color !== null && 'id' in color ? removeColor(color.id, $event) : undefined" 
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Remove color"
                  :disabled="typeof color !== 'object' || color === null"
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
          
          <!-- Add new color button - now toggles serial mode with enhanced visual feedback -->
          <button 
            @click="toggleSerialMode" 
            class="w-full py-2 border-2 rounded-md transition-colors"
            :class="isSerialMode ? 'border-blue-400 dark:border-blue-300 bg-blue-500 dark:bg-blue-600 text-white' : 'border-dashed border-gray-300 dark:border-gray-500 text-gray-600 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-300 hover:text-blue-500 dark:hover:text-blue-300'"
            :title="isSerialMode ? 'Exit Serial Mode - Stop adding colors and return to normal viewing mode' : 'Add Colors (Serial Mode) - Click to enable color sampling mode where you can click on the image to add colors to the palette'"
          >
            <span class="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <!-- Original size plus sign -->
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              {{ isSerialMode ? 'Exit Serial Mode' : 'Add Colors (Serial Mode)' }}
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
            <div class="flex space-x-2 items-center">
              <!-- Zoom In button -->
              <button 
                @click="zoomIn" 
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded"
                title="Zoom In - Enlarge the image for more detailed color selection"
              >
                <!-- Larger plus sign SVG -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>

              <!-- Zoom Out button -->
              <button 
                @click="zoomOut" 
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded"
                title="Zoom Out - Reduce image size to see more of the image at once"
              >
                <!-- Larger minus sign SVG -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>

              <!-- Fit Image button -->
              <button 
                @click="fitImage" 
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded"
                title="Zoom to Fit - Resize the image to fit within the viewing area"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 01-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Fill Image button -->
              <button 
                @click="fillImage" 
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded"
                title="Zoom to Fill - Enlarge the image to fill the viewing area (may crop parts of the image)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clip-rule="evenodd" />
                </svg>
              </button>

              <!-- Pan Mode button -->
              <button 
                @click="togglePanMode" 
                class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 rounded"
                :class="{ 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400': isPanModeActive }"
                title="Pan Mode - Click and drag to move the image around (disables color sampling while active)"
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
            class="relative h-[calc(100%-60px)] overflow-auto bg-gray-200 dark:bg-gray-700 rounded-lg" 
            ref="imageContainer"
            @mouseenter="handleImageMouseEnter"
            @mouseleave="handleImageMouseLeave"
            @mousemove="handleMouseMove"
            @scroll="handleScroll"
            @wheel.passive="handleWheel"
            @click="handleImageClick"
            :class="{ 
              'cursor-grab': isPanModeActive && !isDraggingImage,
              'cursor-grabbing': isPanModeActive && isDraggingImage,
              'cursor-crosshair': isColorSamplingEnabled && !isPanModeActive
            }"
          >
            <!-- Large scrollable area (3x zoomed image size) to allow scrolling in all directions -->
            <div 
              v-if="uploadedURL"
              class="relative"
              :style="{
                                                                                                  width: imageRef?.naturalWidth ? `${IMAGE_CONTAINER_SIZE_MULTIPLIER * zoomLevel * imageRef.naturalWidth}px` : `${IMAGE_CONTAINER_SIZE_MULTIPLIER * 100}%`,
          height: imageRef?.naturalHeight ? `${IMAGE_CONTAINER_SIZE_MULTIPLIER * zoomLevel * imageRef.naturalHeight}px` : `${IMAGE_CONTAINER_SIZE_MULTIPLIER * 100}%`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }"
            >
              <img 
                :src="uploadedURL" 
                alt="Palette source image" 
                class="transform max-w-none pixel-perfect"
                ref="imageRef"
                @load="handleImageLoaded"
                @error="handleImageError"
                crossorigin="anonymous"
                :style="{ 
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center'
                }"
              />
            </div>
            <div v-else class="flex items-center justify-center h-full">
              <p class="text-gray-500 dark:text-gray-400">No image available</p>
            </div>
            
            <!-- Color selector overlay - simplified to show only color swatch -->
            <div 
              v-if="showColorSelector"
              class="color-selector-overlay absolute pointer-events-none"
              :style="{
                width: '24px',
                height: '24px',
                left: `${colorSelectorPosition.x - 12}px`,
                top: `${colorSelectorPosition.y - 12}px`,
                border: '2px solid white',
                boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.8)',
                backgroundColor: sampledColor,
                zIndex: 10,
                borderRadius: '50%', // circular
                position: 'absolute',
                pointerEvents: 'none',
              }"
            >
              <!-- No text content - just the color swatch -->
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- No palette found (only show if we've finished loading and there's no error) -->
    <div v-else-if="!loading && !error" class="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg my-4">
      <p class="text-yellow-700 dark:text-yellow-400">No palette found with the specified ID.</p>
      
      <div v-if="showCreateSampleButton" class="mt-4">
        <button 
          @click="createSamplePalette(route.params.id?.toString() || '')"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
          title="Create Sample Palette - Generate a demo palette with sample colors for testing and demonstration purposes"
        >
          Create Sample Palette
        </button>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          This will create a sample palette with this ID for demonstration purposes.
        </p>
      </div>
    </div>
    
    <!-- Delete confirmation modal -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      v-model="showDeleteConfirm"
      title="Delete Color"
      :message="deleteConfirmMessage"
      :position="deleteButtonPosition"
      confirmVariant="danger"
      confirmText="Delete"
      :colorData="colorToDeleteData"
      @confirm="confirmDeleteColor"
      @cancel="showDeleteConfirm = false"
    >
      <!-- The color preview is now handled by the colorData prop -->
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useImagesStore } from '~/stores/images'
import { storeToRefs } from 'pinia'
import type { Palette, Color, PaletteColor } from '~/types/palette'
import ConfirmModal from '~/components/ConfirmModal.vue'
import UiButton from '~/components/ui/Button.vue'

// Add TypeScript interface augmentation for the File System Access API
declare global {
  interface Window {
    showSaveFilePicker?: (options?: {
      suggestedName?: string;
      types?: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
      excludeAcceptAllOption?: boolean;
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }) => Promise<any>;
  }
}

// Router and route
const route = useRoute()
const router = useRouter()

// Configuration constants
const IMAGE_CONTAINER_SIZE_MULTIPLIER = 2 // How many times larger the scrollable imageContainer should be compared to the scaled image

// Store
const imagesStore = useImagesStore()
const imageData = ref<any>(null)

// Local state
const loading = ref(true) // Start with loading state on page load
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
const lastMousePositionGlobal = ref({ x: 0, y: 0 }) // Track global mouse position for scroll events
const sampledColor = ref<string>('')
const canvasRef = ref<HTMLCanvasElement | null>(null)
const colorListRef = ref<HTMLDivElement | null>(null)
const lastAddedColorId = ref<string | null>(null)
const samplingState = ref({
  mode: 'none' as 'none' | 'edit' | 'serial', // Modes: 'none', 'edit', 'serial'
  selectedColorId: null as string | null,
})

// Dark mode detection
const isDarkMode = ref(false)

// Function to check dark mode
function checkDarkMode() {
  isDarkMode.value = document.documentElement.classList.contains('dark')
}

// Pan mode is now replaced by natural scrolling
function togglePanMode(): void {
  // Pan mode functionality is replaced by native scrolling
  // This function is kept for UI compatibility but does nothing
  console.log('Pan mode is now handled by native scrolling')
}

// Modified zoom functions with smooth, predictable scaling
function zoomIn(): void {
  // Use consistent 1.5x multiplier for smooth zooming
  zoomLevel.value = Math.round(zoomLevel.value * 1.5 * 10) / 10 // Round to 1 decimal place
  updateImageTransform()
  // Recenter the scrolling container after zoom
  setTimeout(() => centerScrollPosition(), 10)
}

function zoomOut(): void {
  // Use consistent 1.5x divisor for smooth zooming (reversible)
  zoomLevel.value = Math.max(Math.round((zoomLevel.value / 1.5) * 10) / 10, 0.1) // Min zoom 0.1x
  updateImageTransform()
  // Recenter the scrolling container after zoom
  setTimeout(() => centerScrollPosition(), 10)
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
  // Recenter the scrolling container after zoom
  setTimeout(() => centerScrollPosition(), 10)
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
  
  updateImageTransform()
  // Recenter the scrolling container after zoom
  setTimeout(() => centerScrollPosition(), 10)
}

function updateImageTransform(): void {
  if (imageRef.value) {
    imageRef.value.style.transform = `scale(${zoomLevel.value})`
    imageRef.value.style.transformOrigin = 'center center'
  }
}

// Center the scroll position to show the image in the middle
function centerScrollPosition(): void {
  if (imageContainer.value && imageRef.value) {
    const container = imageContainer.value
    const image = imageRef.value
    
    // Calculate the actual size of the wrapper div (IMAGE_CONTAINER_SIZE_MULTIPLIER * zoomLevel * image dimensions)
    const wrapperWidth = IMAGE_CONTAINER_SIZE_MULTIPLIER * zoomLevel.value * image.naturalWidth
    const wrapperHeight = IMAGE_CONTAINER_SIZE_MULTIPLIER * zoomLevel.value * image.naturalHeight
    
    // Calculate the center position
    // If wrapper is larger than container, scroll to center
    // If wrapper is smaller than container, scroll to 0 (no scrolling needed)
    const centerX = wrapperWidth > container.clientWidth 
      ? (wrapperWidth - container.clientWidth) / 2 
      : 0
    const centerY = wrapperHeight > container.clientHeight 
      ? (wrapperHeight - container.clientHeight) / 2 
      : 0
    
    // Set scroll position to center
    container.scrollLeft = centerX
    container.scrollTop = centerY
    
    console.log('Centering scroll:', {
      wrapperSize: { width: wrapperWidth, height: wrapperHeight },
      containerSize: { width: container.clientWidth, height: container.clientHeight },
      scrollTo: { left: centerX, top: centerY },
      zoomLevel: zoomLevel.value
    })
  }
}

// Set up event listeners and initialize
onMounted(() => {
  // Set up dark mode detection
  checkDarkMode()
  const observer = new MutationObserver(checkDarkMode)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  
  // Pan mode replaced by native scrolling - no drag listeners needed
  
  // Fetch image data and set up resize listener
  const imageId = route.params.id?.toString();
  console.log('Component mounted, image ID:', imageId);
  if (imageId) {
    fetchImage(imageId);
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
  
  // No drag listeners to clean up
  
  // Clean up resize listener
  window.removeEventListener('resize', updateImageColumnWidth);
})

// Computed properties
const palette = computed(() => {
  if (!imageData.value) return null
  return {
    id: imageData.value.id,
    paletteName: imageData.value.name,
    description: imageData.value.description,
    colorPalette: imageData.value.colorPalette || [],
    createdDateTime: imageData.value.created_at,
    uploadedURL: imageData.value.url,
    uploadedFilePath: null,
    cachedFilePath: imageData.value.file_path,
    width: imageData.value.width,
    height: imageData.value.height,
    format: imageData.value.content_type?.split('/')[1] || '',
    fileSizeBytes: imageData.value.file_size || 0
  }
})

const uploadedURL = computed(() => {
  const imageId = route.params.id?.toString();
  if (!imageId) return ''
  
  // First priority: Use the file_path from imageData (the real local images)
  if (imageData.value && imageData.value.file_path) {
    console.log('Using file_path from imageData:', imageData.value.file_path)
    return imageData.value.file_path
  }
  
  // Second priority: Use the real image URL from the images store
  const image = imagesStore.images.find(img => img.id === imageId)
  if (image?.url) {
    console.log('Using real image URL from store:', image.url)
    return image.url
  }
  
  // Second priority: Check for cached file path and convert to web URL
  if (image?.cachedFilePath) {
    // Convert absolute path to relative web URL
    // From: /Users/.../public/images/img-xxx.jpeg
    // To: /images/img-xxx.jpeg
    const webUrl = image.cachedFilePath.replace(/.*\/public/, '')
    console.log('Using cached file path as web URL:', webUrl)
    return webUrl
  }
  
  // Third priority: Try the direct URL from the API response
  if (imageData.value && imageData.value.url) {
    console.log('Using direct URL from imageData:', imageData.value.url)
    return imageData.value.url
  }
  
  // Fourth priority: Try the uploaded URL from palette
  if (palette.value && palette.value.uploadedURL) {
    console.log('Using palette uploadedURL:', palette.value.uploadedURL)
    return palette.value.uploadedURL
  }
  
  // Last resort: Use the file endpoint (artificial images)
  const url = `/api/images/${imageId}/file`
  console.log('Using file endpoint URL as fallback:', url)
  return url
})

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

// Add state for tracking the position of the delete button
const deleteButtonPosition = ref({ x: null, y: null })

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

// Color management functions
const showEditModal = ref(false)
const colorToEdit = ref<Color | null>(null)
function editColor(color: Color): void {
  colorToEdit.value = color
  showEditModal.value = true
}
function closeEditModal() {
  showEditModal.value = false
  colorToEdit.value = null
}

function removeColor(colorId: string, event: MouseEvent): void {
  console.log('removeColor called for colorId:', colorId)
  colorToDelete.value = colorId
  deleteButtonPosition.value = { x: event.clientX, y: event.clientY }
  if (palette.value) {
    const colorToDelete = palette.value.colorPalette.find(
      color => typeof color === 'object' && color !== null && 'id' in color && color.id === colorId
    )
    if (colorToDelete) {
      if (typeof colorToDelete === 'object' && colorToDelete !== null) {
        colorToDeleteData.value = { ...colorToDelete }
      } else {
        colorToDeleteData.value = { hex: String(colorToDelete) }
      }
    }
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
    const formattedExport = {
      createdDateTime: palette.value.createdDateTime || new Date().toISOString(),
      uploadedURL: palette.value.uploadedURL || '',
      uploadedFilePath: palette.value.uploadedFilePath || null,
      cachedFilePath: palette.value.cachedFilePath || '',
      width: palette.value.width || 0,
      height: palette.value.height || 0,
      format: palette.value.format || '',
      fileSizeBytes: palette.value.fileSizeBytes || 0,
      colorPalette: palette.value.colorPalette || [],
      paletteName: palette.value.paletteName || 'Untitled Palette',
    }
    const jsonString = JSON.stringify(formattedExport, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const defaultFilename = `${(palette.value.paletteName || 'palette').replace(/\s+/g, '-').toLowerCase()}-palette.json`
    
    try {
      // Use the File System Access API if available (modern browsers)
      if ('showSaveFilePicker' in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: defaultFilename,
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] }
          }],
          // Try to start in Downloads folder
          startIn: 'downloads'
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        
        console.log('Palette exported successfully using File System Access API');
      } else {
        // Fallback for browsers without File System Access API
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultFilename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Palette exported successfully using download attribute fallback');
      }
    } catch (error) {
      console.error('Error with file picker, falling back to direct download:', error);
      
      // Fallback if file picker fails or is cancelled
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting palette:', error);
    alert('Failed to export palette. Please try again.');
  }
}

// Handle image loading errors
function handleImageError(e: Event): void {
  try {
    const imgElement = e.target as HTMLImageElement;
    const imgSrc = imgElement.src;
    // Log the error with more details
    console.error('Image failed to load:', imgSrc);
    console.log('Route params:', route.params);
    console.log('ImageData:', imageData.value);
    console.log('Palette:', palette.value);
    
    // Use a data URI for a fallback image
    imgElement.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22600%22%20viewBox%3D%220%200%20800%20600%22%3E%3Crect%20fill%3D%22%23f0f0f0%22%20width%3D%22800%22%20height%3D%22600%22%2F%3E%3Ctext%20fill%3D%22%23999999%22%20font-family%3D%22Arial%2C%20sans-serif%22%20font-size%3D%2224%22%20text-anchor%3D%22middle%22%20x%3D%22400%22%20y%3D%22300%22%3EImage%20Not%20Available%3C%2Ftext%3E%3C%2Fsvg%3E';
  } catch (err) {
    console.log('Error in handleImageError:', err);
  }
}

// Function to confirm and execute color deletion
// OPTIMIZED: Remove excessive logging and improve performance
async function confirmDeleteColor(): Promise<void> {
  if (!colorToDelete.value || !palette.value) return
  
  try {
    // Create a copy of the palette
    const updatedPalette = { ...palette.value }
    
    // Filter out the color to delete
    updatedPalette.colorPalette = updatedPalette.colorPalette.filter(
      color => !(typeof color === 'object' && color !== null && 'id' in color && color.id === colorToDelete.value)
    )
    
    // Update local imageData immediately for fast UI updates
    if (imageData.value) {
      imageData.value = { ...imageData.value, colorPalette: updatedPalette.colorPalette };
    }
    
    // Reset the modal
    showDeleteConfirm.value = false
    
    // Update store in background (non-blocking)
    imagesStore.updateImage(String(updatedPalette.id), updatedPalette)
      .catch(err => console.error('Error updating store after delete:', err));
    
    // Reset the color to delete
    colorToDelete.value = null
    colorToDeleteData.value = null
  } catch (err) {
    console.error('Error deleting color:', err)
    // You could add error handling UI here
  }
}

// Fetch the image data by image_id
async function fetchImage(imageId: string): Promise<void> {
  loading.value = true;
  error.value = null;
  imageData.value = null;
  try {
    // Ensure images store is loaded first
    await imagesStore.fetchImages();
    
    if (imagesStore.getImage) {
      const img = await imagesStore.getImage(imageId)
      if (img) {
        imageData.value = img
      } else {
        error.value = 'No image found with the specified ID.'
      }
    }
  } catch (err: any) {
    error.value = 'Failed to load image. Please try again.';
  } finally {
    loading.value = false;
  }
}

// Fetch data on component mount
onMounted(async () => {
  const imageId = route.params.id?.toString();
  if (imageId) {
    await fetchImage(imageId);
    setupResizeListener();
  }
});

// Add a watcher to handle route changes
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await fetchImage(newId.toString());
  }
});

async function savePalette() {
  if (!palette.value) return
  
  try {
    // Save the current palette - ensure ID is a string
    await imagesStore.updateImage(String(palette.value.id), palette.value)
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
    // Center the scroll position after fitting
    centerScrollPosition();
  }, 100);
}

// Watch for image URL changes to apply zoom-to-fit when image loads
watch(uploadedURL, (newUrl) => {
  if (newUrl) {
    console.log('Image URL changed, waiting for load');
    // Reset zoom level to ensure consistent behavior
    zoomLevel.value = 1;
    // Reset previous sampled position so next mouse move will sample
    prevSampledPosition.value = null;
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

// Handle mouse movement events
function handleMouseMove(e: MouseEvent) {
  if (!imageContainer.value) return
  
  // Store global mouse position for scroll events
  lastMousePositionGlobal.value = {
    x: e.clientX,
    y: e.clientY
  }
  
  // Check if mouse is actually over the image with transforms
  if (imageRef.value && isColorSamplingEnabled.value) {
    const imageRect = imageRef.value.getBoundingClientRect()
    const mouseOverImage = (
      e.clientX >= imageRect.left && 
      e.clientX <= imageRect.right && 
      e.clientY >= imageRect.top && 
      e.clientY <= imageRect.bottom
    )
    showColorSelector.value = mouseOverImage
  }
  
  updateColorSelectorPosition(e)
}

// Handle scroll events 
function handleScroll(e: Event) {
  updateColorSelectorAfterScroll()
}

// Handle wheel events (which may not immediately trigger scroll events)
function handleWheel(e: WheelEvent) {
  // Small delay to allow scroll to update, then update color selector
  setTimeout(() => {
    updateColorSelectorAfterScroll()
  }, 10)
}

// Update color selector position after scroll/wheel events
function updateColorSelectorAfterScroll() {
  if (!showColorSelector.value || !imageContainer.value) return
  
  // Get current mouse position relative to the container (accounting for scroll)
  if (lastMousePositionGlobal.value.x !== 0 || lastMousePositionGlobal.value.y !== 0) {
    // Use the same calculation that accounts for transforms
    const newPosition = calculateColorSelectorPosition(
      lastMousePositionGlobal.value.x, 
      lastMousePositionGlobal.value.y
    )
    colorSelectorPosition.value = newPosition
    
    // Also update the sampled color if in sampling mode
    if (isColorSamplingEnabled.value && !samplingBlocked.value && imageRef.value && imageRef.value.complete) {
      if (!updateColorSelectorAfterScroll.throttleTimeout) {
        updateColorSelectorAfterScroll.throttleTimeout = setTimeout(() => {
          const color = getColorAtPosition()
          sampledColor.value = color || ''
          updateColorSelectorAfterScroll.throttleTimeout = null
        }, 50) // Faster throttle for scroll events
      }
    }
  }
}

// Calculate color selector position accounting for image transforms and scroll
function calculateColorSelectorPosition(mouseX: number, mouseY: number) {
  if (!imageContainer.value || !imageRef.value) return { x: 0, y: 0 }

  const containerRect = imageContainer.value.getBoundingClientRect()
  const imageRect = imageRef.value.getBoundingClientRect()
  
  // Position relative to the container's VIEWPORT (not scrolled area)
  const containerRelativeX = mouseX - containerRect.left
  const containerRelativeY = mouseY - containerRect.top
  
  // CRITICAL FIX: Add scroll offset to position the circle correctly
  // The color selector is positioned absolutely within the scrollable container,
  // so we need to add the scroll offset to get the correct position within the scrolled content
  const scrollAdjustedX = containerRelativeX + imageContainer.value.scrollLeft
  const scrollAdjustedY = containerRelativeY + imageContainer.value.scrollTop
  
  // Check if mouse is actually over the image
  const mouseOverImage = (
    mouseX >= imageRect.left && 
    mouseX <= imageRect.right && 
    mouseY >= imageRect.top && 
    mouseY <= imageRect.bottom
  )
  
  if (!mouseOverImage) {
    // If mouse is not over image, position color selector at mouse position anyway
    // This allows for better debugging and user feedback
    return { x: scrollAdjustedX, y: scrollAdjustedY }
  }
  
  // Return the scroll-adjusted position for the color selector overlay
  // The color selector overlay is positioned absolutely within the scrollable container
  return { x: scrollAdjustedX, y: scrollAdjustedY }
}

// OPTIMIZED: Add this function to update the color selector position with better throttling
function updateColorSelectorPosition(e: MouseEvent) {
  if (!imageContainer.value) return

  const newPosition = calculateColorSelectorPosition(e.clientX, e.clientY)
  colorSelectorPosition.value = newPosition

  // Only sample the color if color sampling is enabled, not blocked, and the mouse has moved
  if (
    isColorSamplingEnabled.value &&
    !samplingBlocked.value &&
    imageRef.value &&
    imageRef.value.complete &&
    (!prevSampledPosition.value ||
      Math.abs(prevSampledPosition.value.x - newPosition.x) > 2 ||
      Math.abs(prevSampledPosition.value.y - newPosition.y) > 2) // Only update if moved >2px
  ) {
    // Better throttling to improve performance
    if (!updateColorSelectorPosition.throttleTimeout) {
      updateColorSelectorPosition.throttleTimeout = setTimeout(() => {
        const color = getColorAtPosition()
        sampledColor.value = color || ''
        prevSampledPosition.value = { ...newPosition }
        updateColorSelectorPosition.throttleTimeout = null
      }, 100) // Increased to 100ms throttle for better performance
    }
  }
}

// Add throttle property to the functions
updateColorSelectorPosition.throttleTimeout = null as any
updateColorSelectorAfterScroll.throttleTimeout = null as any

// Add a function to get the color at the current position (optional)
function getColorAtPosition(): string | null {
  if (!imageRef.value || !imageContainer.value) return null

  try {
    // Create canvas if it doesn't exist
    if (!canvasRef.value) {
      canvasRef.value = document.createElement('canvas')
    }
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null

    // Set canvas size to match image's natural dimensions
    canvas.width = imageRef.value.naturalWidth
    canvas.height = imageRef.value.naturalHeight

    // If the imageRef does not have crossOrigin set, reload it with crossOrigin
    if (imageRef.value.crossOrigin !== 'anonymous') {
      const offscreenImg = new window.Image()
      offscreenImg.crossOrigin = 'anonymous'
      offscreenImg.src = imageRef.value.src
      // Only draw if loaded
      if (!offscreenImg.complete) {
        offscreenImg.onload = () => {
          ctx.drawImage(offscreenImg, 0, 0)
        }
        return null // Wait for load
      } else {
        ctx.drawImage(offscreenImg, 0, 0)
      }
    } else {
      ctx.drawImage(imageRef.value, 0, 0)
    }

    // Get container and image rectangles
    const containerRect = imageContainer.value.getBoundingClientRect()
    const imageRect = imageRef.value.getBoundingClientRect()
    
    // COMPLETELY REWRITTEN: Simple and accurate coordinate conversion
    // Convert mouse position (stored in colorSelectorPosition) to image pixel coordinates
    
    // The colorSelectorPosition already includes scroll offset and is positioned correctly
    // We need to convert this position directly to image coordinates
    
    // 1. Get the mouse position relative to the container (already includes scroll offset)
    const mouseContainerX = colorSelectorPosition.value.x
    const mouseContainerY = colorSelectorPosition.value.y
    
    // 2. We need to subtract the scroll offset since colorSelectorPosition includes it
    // but we want the position relative to the content, not the container viewport
    const scrollAdjustedX = mouseContainerX - imageContainer.value.scrollLeft
    const scrollAdjustedY = mouseContainerY - imageContainer.value.scrollTop
    
    // 3. Convert to global coordinates
    const mouseGlobalX = scrollAdjustedX + containerRect.left
    const mouseGlobalY = scrollAdjustedY + containerRect.top
    
    // 4. Convert to image-relative coordinates (accounting for image transforms)
    const imageRelativeX = mouseGlobalX - imageRect.left
    const imageRelativeY = mouseGlobalY - imageRect.top
    
    // 5. Convert from visual image coordinates to original image pixel coordinates
    // The imageRect gives us the actual visual size after transforms
    const scaleX = imageRef.value.naturalWidth / imageRect.width
    const scaleY = imageRef.value.naturalHeight / imageRect.height
    
    const pixelX = imageRelativeX * scaleX
    const pixelY = imageRelativeY * scaleY
    
    // 6. Clamp to image boundaries
    const boundedX = Math.max(0, Math.min(Math.floor(pixelX), imageRef.value.naturalWidth - 1))
    const boundedY = Math.max(0, Math.min(Math.floor(pixelY), imageRef.value.naturalHeight - 1))
    
    // Only log during clicks, not mouse movements
    if (window.debugColorSampling) {
      console.log('🎨🎨🎨 FIXED COLOR SAMPLING CALCULATION 🎨🎨🎨')
      console.log('🟦 Color Selector Position (includes scroll):', { x: colorSelectorPosition.value.x, y: colorSelectorPosition.value.y })
      console.log('📜 Container Scroll Offset:', { scrollLeft: imageContainer.value.scrollLeft, scrollTop: imageContainer.value.scrollTop })
      console.log('🔧 Scroll Adjusted Position:', { x: scrollAdjustedX, y: scrollAdjustedY })
      console.log('📦 Container Rect:', { left: containerRect.left, top: containerRect.top, width: containerRect.width, height: containerRect.height })
      console.log('🖼️ Image Rect (with transforms):', { left: imageRect.left, top: imageRect.top, width: imageRect.width, height: imageRect.height })
      console.log('🌍 Mouse Global Position:', { x: mouseGlobalX, y: mouseGlobalY })
      console.log('📍 Image Relative Position:', { x: imageRelativeX, y: imageRelativeY })
      console.log('📐 Image Natural Size:', { width: imageRef.value.naturalWidth, height: imageRef.value.naturalHeight })
      console.log('📊 Scale Factors:', { scaleX, scaleY })
      console.log('🎯 Calculated Pixel Position:', { x: pixelX, y: pixelY })
      console.log('✅ FINAL BOUNDED COORDS:', { x: boundedX, y: boundedY })
      console.log('🎨🎨🎨 END FIXED CALCULATION 🎨🎨🎨')
    }
    
    // Get pixel data
    const pixel = ctx.getImageData(boundedX, boundedY, 1, 1).data
    const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`
    return hex
  } catch (error: any) {
    if (error instanceof DOMException && error.name === 'SecurityError') {
      samplingBlocked.value = true
      console.error('Color sampling blocked due to CORS/security policy.')
    }
    console.error('Error sampling color:', error)
    return null
  }
}

// Function to toggle color selection
function toggleColorSelection(colorId: string): void {
  console.log('toggleColorSelection called for colorId:', colorId)
  if (samplingState.value.selectedColorId === colorId) {
    enterNoneMode();
  } else {
    enterEditMode(colorId);
  }
}

// Helper for template: is color sampling enabled?
const isColorSamplingEnabled = computed(() =>
  samplingState.value.mode === 'edit' || samplingState.value.mode === 'serial'
);

// Helper for template: is serial mode?
const isSerialMode = computed(() => samplingState.value.mode === 'serial');

// Helper for template: is edit mode?
const isEditMode = computed(() => samplingState.value.mode === 'edit');

// Update usages in addSampledColor
function addSampledColor() {
  const startTime = performance.now();
  console.log('🟢 Starting addSampledColor');
  
  if (!sampledColor.value || !palette.value) return;
  const rgbValues = hexToRgbArray(sampledColor.value);
  const hsvValues = rgbToHsv(rgbValues[0], rgbValues[1], rgbValues[2]);
  const updatedPalette = { ...palette.value };
  const colors = Array.isArray(updatedPalette.colorPalette)
    ? updatedPalette.colorPalette
    : (updatedPalette.colorPalette as Record<string, any>)?.length
      ? Object.values(updatedPalette.colorPalette as Record<string, any>)
      : [];
  if (samplingState.value.mode === 'edit' && samplingState.value.selectedColorId) {
    const colorIndex = colors.findIndex((c: any) => c.id === samplingState.value.selectedColorId);
    if (colorIndex !== -1) {
      const updatedColors = [...colors];
      updatedColors[colorIndex] = {
        ...updatedColors[colorIndex],
        hex: sampledColor.value,
        rgb: rgbValues,
        hsv: hsvValues,
      };
      updatedPalette.colorPalette = updatedColors;
      lastAddedColorId.value = samplingState.value.selectedColorId;
      
      console.log('🔵 About to update imageData (edit mode), time:', performance.now() - startTime, 'ms');
      
      // Update local imageData immediately for fast UI updates
      if (imageData.value) {
        imageData.value = { ...imageData.value, colorPalette: updatedPalette.colorPalette };
      }
      
      console.log('🟡 Updated imageData (edit mode), time:', performance.now() - startTime, 'ms');
      
      // Update store in background (non-blocking)
      imagesStore.updateImage(String(updatedPalette.id), updatedPalette)
        .catch(err => console.error('Error updating palette:', err));
      
      console.log('🟠 About to scroll (edit mode), time:', performance.now() - startTime, 'ms');
      // Scroll immediately since DOM is already updated
      scrollToColor();
      console.log('🔴 Finished addSampledColor (edit mode), total time:', performance.now() - startTime, 'ms');
      return;
    }
  }
  // Serial mode or no color selected: add new color
  const newColorId = `color-${Date.now()}`;
  const newColor = {
    id: newColorId,
    hex: sampledColor.value,
    rgb: rgbValues,
    hsv: hsvValues,
    position: colors.length,
  };
  updatedPalette.colorPalette = [...colors, newColor];
  lastAddedColorId.value = newColorId;
  console.log('🔵 About to update imageData (new color), time:', performance.now() - startTime, 'ms');
  
  // Update local imageData immediately for fast UI updates
  if (imageData.value) {
    imageData.value = { ...imageData.value, colorPalette: updatedPalette.colorPalette };
  }
  
  console.log('🟡 Updated imageData (new color), time:', performance.now() - startTime, 'ms');
  
  // Update store in background (non-blocking)
  imagesStore.updateImage(String(updatedPalette.id), updatedPalette)
    .catch(err => console.error('Error updating palette:', err));
  
  console.log('🟠 About to scroll (new color), time:', performance.now() - startTime, 'ms');
  // Scroll immediately since DOM is already updated
  scrollToColor();
  if (samplingState.value.mode === 'edit') {
    samplingState.value.selectedColorId = newColorId;
  }
  console.log('🔴 Finished addSampledColor (new color), total time:', performance.now() - startTime, 'ms');
}

// Helper function to convert hex to rgb array
function hexToRgbArray(hex: string): number[] {
  // Remove # if present
  hex = hex.replace(/^#/, '')
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  return [r, g, b]
}

// Helper function to convert rgb to hsv
function rgbToHsv(r: number, g: number, b: number): number[] {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  
  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max
  
  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  
  // Convert to the format in the JSON (h: 0-360, s: 0-100, v: 0-100)
  return [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(v * 100)
  ]
}

// Handle image click events
function handleImageClick(e: MouseEvent) {
  // Enable debug logging for this click
  window.debugColorSampling = true
  
  // Check if we're in corner testing mode
  if (cornerTestingMode.value) {
    handleCornerTestClick(e)
    return
  }
  
  // Log position data on click with detailed coordinates
  if (showColorSelector.value && imageContainer.value && imageRef.value) {
    const containerRect = imageContainer.value.getBoundingClientRect()
    const imageRect = imageRef.value.getBoundingClientRect()
    
    console.log('🧮 DETAILED CLICK POSITION ANALYSIS:')
    console.log('📍 Mouse Global Position:', { x: e.clientX, y: e.clientY })
    console.log('📦 Container Rect:', { 
      left: containerRect.left, 
      top: containerRect.top, 
      width: containerRect.width, 
      height: containerRect.height 
    })
    console.log('🖼️ Image Rect (with transforms):', { 
      left: imageRect.left, 
      top: imageRect.top, 
      width: imageRect.width, 
      height: imageRect.height 
    })
    console.log('📏 Image Natural Size:', { width: imageRef.value.naturalWidth, height: imageRef.value.naturalHeight })
    console.log('🔄 Container Scroll:', { scrollTop: imageContainer.value.scrollTop, scrollLeft: imageContainer.value.scrollLeft })
    console.log('🎯 Color Selector Position:', colorSelectorPosition.value)
    console.log('🔍 Zoom Level:', zoomLevel.value)
    console.log('📌 Mouse Relative to Container:', { x: e.clientX - containerRect.left, y: e.clientY - containerRect.top })
    
    // Calculate position relative to the image (accounting for transforms)
    const imageRelativeX = e.clientX - imageRect.left
    const imageRelativeY = e.clientY - imageRect.top
    console.log('🎪 Mouse Relative to Image (visual):', { x: imageRelativeX, y: imageRelativeY })
    
    // Calculate what pixel should be sampled
    const scaleX = imageRef.value.naturalWidth / imageRect.width
    const scaleY = imageRef.value.naturalHeight / imageRect.height
    const pixelX = Math.round(imageRelativeX * scaleX)
    const pixelY = Math.round(imageRelativeY * scaleY)
    console.log('🎯 Should Sample Pixel At:', { x: pixelX, y: pixelY })
    console.log('📊 Scale Factors:', { scaleX, scaleY })
    console.log('────────────────────────────────────────────────────────────')
  }
  
  // Add sampled color if in sampling mode
  if (showColorSelector.value && isColorSamplingEnabled.value) {
    addSampledColor()
  }
  
  // Disable debug logging after a short delay
  setTimeout(() => {
    window.debugColorSampling = false
  }, 100)
}

// Update handleImageMouseEnter
function handleImageMouseEnter() {
  if (!isPanModeActive.value && isColorSamplingEnabled.value) {
    showColorSelector.value = true;
  }
}

function handleImageMouseLeave() {
  showColorSelector.value = false;
}

// Helper function to parse RGB string into array
function parseRgbString(rgbStr: string): number[] {
  // Handle format like "rgb(255, 87, 51)"
  const matches = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (matches && matches.length === 4) {
    return [parseInt(matches[1]), parseInt(matches[2]), parseInt(matches[3])]
  }
  return [0, 0, 0] // Fallback
}

// Add a function to create a sample palette if none exists
function createSamplePalette(id: string) {
  if (!palette.value) {
    console.log('Creating sample palette with ID:', id);
    
    // Create a sample palette
    const samplePalette = {
      id: id,
      paletteName: `Sample Palette ${id}`,
      createdDateTime: new Date().toISOString(),
      colorPalette: [
        {
          id: `color-${id}-1`,
          hex: '#FF5733',
          rgb: [255, 87, 51],
          name: 'Coral Red',
          position: 1
        },
        {
          id: `color-${id}-2`,
          hex: '#33FF57',
          rgb: [51, 255, 87],
          name: 'Lime Green',
          position: 2
        },
        {
          id: `color-${id}-3`,
          hex: '#3357FF',
          rgb: [51, 87, 255],
          name: 'Royal Blue',
          position: 3
        }
      ],
      uploadedURL: 'https://picsum.photos/800/600'
    };
    
    // Save the sample palette to local storage
    imagesStore.updateImage(id, samplePalette);
    
    // Fetch the palette again
    fetchImage(id);
  }
}

// Add a button to create a sample palette
const showCreateSampleButton = computed(() => {
  return error.value === 'No image found with the specified ID.' && !palette.value;
});

function enterNoneMode() {
  samplingState.value.mode = 'none';
  samplingState.value.selectedColorId = null;
}

function enterEditMode(colorId: string) {
  samplingState.value.mode = 'edit';
  samplingState.value.selectedColorId = colorId;
}

function enterSerialMode() {
  samplingState.value.mode = 'serial';
  samplingState.value.selectedColorId = null;
}

function toggleSerialMode() {
  if (samplingState.value.mode === 'serial') {
    enterNoneMode();
  } else {
    enterSerialMode();
  }
}

// Function to scroll to the last added/updated color
async function scrollToColor() {
  if (!lastAddedColorId.value || !colorListRef.value) {
    console.log('Cannot scroll: missing lastAddedColorId or colorListRef')
    return
  }
  
  console.log('Attempting to scroll to color:', lastAddedColorId.value)
  
  // Function to attempt scrolling with retries
  const attemptScroll = (attempt = 1, maxAttempts = 5) => {
    const colorElement = colorListRef.value?.querySelector(`[data-color-id="${lastAddedColorId.value}"]`)
    
    if (colorElement) {
      // Scroll the element into view with smooth behavior
      colorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      return true
    } else {
      if (attempt < maxAttempts) {
        // Try again with a short delay
        setTimeout(() => attemptScroll(attempt + 1, maxAttempts), 20)
      }
      return false
    }
  }
  
  // Wait for Vue to update the DOM first
  await nextTick()
  
  // Start the retry attempts
  attemptScroll()
}

const prevSampledPosition = ref<{ x: number; y: number } | null>(null)
const samplingBlocked = ref(false)

// Set up event listeners and initialize
onMounted(() => {
  // Set up dark mode detection
  checkDarkMode()
  const observer = new MutationObserver(checkDarkMode)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  
  // Pan mode replaced by native scrolling - no drag listeners needed
  
  // Add global mouse tracking for better color selector positioning
  document.addEventListener('mousemove', trackGlobalMouse)
  
  // Fetch image data and set up resize listener
  const imageId = route.params.id?.toString();
  console.log('Component mounted, image ID:', imageId);
  if (imageId) {
    fetchImage(imageId);
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
  
  // Clean up global mouse tracking
  document.removeEventListener('mousemove', trackGlobalMouse)
  
  // Clean up resize listener
  window.removeEventListener('resize', updateImageColumnWidth);
})

// Global mouse tracking for better color selector positioning
function trackGlobalMouse(e: MouseEvent) {
  lastMousePositionGlobal.value = { x: e.clientX, y: e.clientY }
  
  // Update color selector position if it's visible and we're in color sampling mode
  if (showColorSelector.value && isColorSamplingEnabled.value && imageContainer.value && imageRef.value) {
    const newPosition = calculateColorSelectorPosition(e.clientX, e.clientY)
    colorSelectorPosition.value = newPosition
  }
}

// Corner testing mode
const cornerTestingMode = ref(false)
const cornerTestStep = ref(0)
const cornerTestResults = ref([])
const cornerTestInstructions = [
  { corner: 'top-left', scrollTo: { top: 'min', left: 'min' }, description: 'Scroll to TOP-LEFT most position and click the TOP-LEFT corner of the image' },
  { corner: 'top-right', scrollTo: { top: 'min', left: 'max' }, description: 'Scroll to TOP-RIGHT most position and click the TOP-RIGHT corner of the image' },
  { corner: 'bottom-right', scrollTo: { top: 'max', left: 'max' }, description: 'Scroll to BOTTOM-RIGHT most position and click the BOTTOM-RIGHT corner of the image' },
  { corner: 'bottom-left', scrollTo: { top: 'max', left: 'min' }, description: 'Scroll to BOTTOM-LEFT most position and click the BOTTOM-LEFT corner of the image' }
]

// Corner testing functions
function startCornerTesting() {
  cornerTestingMode.value = true
  cornerTestStep.value = 0
  cornerTestResults.value = []
  isColorSamplingEnabled.value = true
  showColorSelector.value = true
  
  console.log('🧪 CORNER TESTING MODE STARTED')
  console.log('📋 Test Plan:', cornerTestInstructions.map(i => i.corner).join(' → '))
  
  // Start with first corner
  nextCornerTest()
}

function handleCornerTestClick(e: MouseEvent) {
  if (cornerTestStep.value >= cornerTestInstructions.length) {
    finishCornerTesting()
    return
  }
  
  const currentTest = cornerTestInstructions[cornerTestStep.value]
  const containerRect = imageContainer.value.getBoundingClientRect()
  const imageRect = imageRef.value.getBoundingClientRect()
  
  // Record test result
  const result = {
    step: cornerTestStep.value,
    corner: currentTest.corner,
    mouseGlobal: { x: e.clientX, y: e.clientY },
    containerRect: { ...containerRect },
    imageRect: { ...imageRect },
    containerScroll: { 
      top: imageContainer.value.scrollTop, 
      left: imageContainer.value.scrollLeft 
    },
    zoomLevel: zoomLevel.value,
    mouseRelativeToContainer: { 
      x: e.clientX - containerRect.left, 
      y: e.clientY - containerRect.top 
    },
    mouseRelativeToImage: { 
      x: e.clientX - imageRect.left, 
      y: e.clientY - imageRect.top 
    },
    expectedPixel: calculateExpectedPixel(currentTest.corner),
    timestamp: Date.now()
  }
  
  cornerTestResults.value.push(result)
  
  console.log(`🎯 CORNER TEST ${cornerTestStep.value + 1}/4: ${currentTest.corner.toUpperCase()}`)
  console.log('📊 Test Result:', result)
  
  // Add the sampled color
  addSampledColor()
  
  // Move to next test
  cornerTestStep.value++
  
  // Setup next test or finish
  if (cornerTestStep.value < cornerTestInstructions.length) {
    setTimeout(() => {
      nextCornerTest()
    }, 1000) // Give time for color to be added
  } else {
    setTimeout(() => {
      finishCornerTesting()
    }, 1000)
  }
}

function nextCornerTest() {
  if (cornerTestStep.value >= cornerTestInstructions.length) {
    finishCornerTesting()
    return
  }
  
  const currentTest = cornerTestInstructions[cornerTestStep.value]
  
  // Scroll to the required position
  scrollToCornerPosition(currentTest.scrollTo)
  
  // Show instruction
  console.log(`🎯 STEP ${cornerTestStep.value + 1}/4: ${currentTest.description}`)
  alert(`CORNER TEST ${cornerTestStep.value + 1}/4\n\n${currentTest.description}\n\nClick OK, then click on the ${currentTest.corner} corner of the image.`)
}

function scrollToCornerPosition(scrollTo) {
  if (!imageContainer.value) return
  
  const container = imageContainer.value
  const maxScrollTop = container.scrollHeight - container.clientHeight
  const maxScrollLeft = container.scrollWidth - container.clientWidth
  
  let scrollTop, scrollLeft
  
  // Handle top position
  if (scrollTo.top === 'max') {
    scrollTop = maxScrollTop
  } else if (scrollTo.top === 'min') {
    scrollTop = 0
  } else {
    scrollTop = scrollTo.top
  }
  
  // Handle left position  
  if (scrollTo.left === 'max') {
    scrollLeft = maxScrollLeft
  } else if (scrollTo.left === 'min') {
    scrollLeft = 0
  } else {
    scrollLeft = scrollTo.left
  }
  
  container.scrollTop = scrollTop
  container.scrollLeft = scrollLeft
  
  console.log(`📜 Scrolled to: {top: ${scrollTop}, left: ${scrollLeft}} (max: {top: ${maxScrollTop}, left: ${maxScrollLeft}})`)
}

function calculateExpectedPixel(corner) {
  if (!imageRef.value) return { x: 0, y: 0 }
  
  const width = imageRef.value.naturalWidth
  const height = imageRef.value.naturalHeight
  
  switch (corner) {
    case 'top-left': return { x: 0, y: 0 }
    case 'top-right': return { x: width - 1, y: 0 }
    case 'bottom-right': return { x: width - 1, y: height - 1 }
    case 'bottom-left': return { x: 0, y: height - 1 }
    default: return { x: 0, y: 0 }
  }
}

function finishCornerTesting() {
  cornerTestingMode.value = false
  
  console.log('🏁 CORNER TESTING COMPLETED!')
  console.log('📊 All Results:', cornerTestResults.value)
  
  // Analyze results
  analyzeCornerTestResults()
  
  alert('Corner testing completed! Check the console for detailed results and analysis.')
}

function analyzeCornerTestResults() {
  console.log('🔍 CORNER TEST ANALYSIS:')
  
  cornerTestResults.value.forEach((result, index) => {
    const expected = result.expectedPixel
    console.log(`\n📍 Test ${index + 1} (${result.corner}):`)
    console.log(`   Expected pixel: {x: ${expected.x}, y: ${expected.y}}`)
    console.log(`   Mouse position: {x: ${result.mouseGlobal.x}, y: ${result.mouseGlobal.y}}`)
    console.log(`   Container scroll: {top: ${result.containerScroll.top}, left: ${result.containerScroll.left}}`)
    console.log(`   Image rect: {left: ${result.imageRect.left}, top: ${result.imageRect.top}, width: ${result.imageRect.width}, height: ${result.imageRect.height}}`)
  })
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
  cursor: default; /* Ensure default cursor on container */
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

/* Ensure the image container respects cursor settings */
[ref="imageContainer"] {
  transition: cursor 0.2s ease;
}

/* Ensure the image has pointer-events to receive mouse events */
[ref="imageRef"] {
  pointer-events: auto;
}

/* Force default cursor on the container */
.palette-detail-container {
  cursor: default !important;
}

/* Force default cursor on the image container unless in pan mode */
[ref="imageContainer"] {
  cursor: default !important;
}

[ref="imageContainer"].pan-mode {
  cursor: grab !important;
}

/* Ensure the image has default cursor */
[ref="imageRef"] {
  cursor: default !important;
}

/* Add a global style to reset cursors */
:deep(*) {
  cursor: inherit;
}
</style>
