<template>
  <div class="min-h-screen transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
    <nav class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex-shrink-0 flex items-center">
              <span class="text-xl font-bold text-primary-600 dark:text-primary-400">Color Palette Tool</span>
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/" 
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Palettes
            </NuxtLink>
            <NuxtLink 
              to="/design-system" 
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Design
            </NuxtLink>
            
            <!-- Add compact offline toggle -->
            <div v-if="isDevelopment" class="flex items-center">
              <label class="inline-flex items-center cursor-pointer">
                <div class="relative">
                  <input type="checkbox" v-model="offlineMode" class="sr-only peer" :disabled="isLoadingJsonl">
                  <div class="w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </div>
                <div class="ml-1 flex flex-col">
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {{ isLoadingJsonl ? 'loading...' : offlineMode ? 'offline' : 'online' }}
                  </span>
                  <span class="text-[10px] text-gray-500 dark:text-gray-500">
                    {{ offlineMode ? '(changes saved locally)' : '(changes saved to server)' }}
                  </span>
                </div>
              </label>
            </div>
            
            <!-- Dark mode toggle -->
            <UiDarkModeToggle />
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="w-full box-border">
      <slot />
    </main>

    <!-- Add the mock data indicator -->
    <MockDataIndicator />

    <!-- Add the JSONL loading indicator -->
    <JsonlLoadingIndicator
      :is-loading="isLoadingJsonl"
      :is-loaded="jsonlLoaded"
      :error="imagesStore.error"
      :file-path="jsonlFilePath"
      :show-indicator="isDevelopment && (isLoadingJsonl || jsonlLoaded || !!imagesStore.error)"
      @load="loadJsonlData"
      @close="dismissJsonlIndicator"
    />
  </div>
</template>

<script setup lang="ts">
// Import the useRoute composable
import { useRoute } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { useImagesStore } from '~/stores/images'
import { useRuntimeConfig } from '#app'
import { usePalettesStore } from '~/stores/palettes'

// Get the current route
const route = useRoute()

// Add this to check if we're in development mode
const isDevelopment = import.meta.env.DEV

// Add these refs and computed properties
const imagesStore = useImagesStore()
const config = useRuntimeConfig()
const jsonlFilePath = computed(() => config.public.imageMetadataJsonlFile)
const isLoadingJsonl = ref(false)
const jsonlLoaded = ref(false)

// Update the method to load JSONL data
async function loadJsonlData() {
  if (!jsonlFilePath.value) {
    console.warn('No JSONL file path configured')
    return
  }
  
  isLoadingJsonl.value = true
  
  try {
    // Load images from JSONL (which will also create palettes)
    await imagesStore.loadJsonlFile()
    jsonlLoaded.value = true
    console.log('JSONL data loaded successfully')
  } catch (error) {
    console.error('Error loading JSONL data:', error)
  } finally {
    isLoadingJsonl.value = false
  }
}

// Enhanced offline mode toggle
const offlineMode = computed({
  get: () => imagesStore.offlineMode,
  set: async (value) => {
    // If turning on offline mode and JSONL not yet loaded, load it first
    if (value && !jsonlLoaded.value && jsonlFilePath.value) {
      await loadJsonlData()
    }
    
    // Then toggle the mode
    imagesStore.toggleOfflineMode(value)
    // Also toggle offline mode in the palettes store to keep them in sync
    const palettesStore = usePalettesStore()
    palettesStore.toggleOfflineMode(value)
  }
})

// Load JSONL data on mount if offline mode is already enabled
onMounted(async () => {
  if (imagesStore.offlineMode && !jsonlLoaded.value && jsonlFilePath.value) {
    await loadJsonlData()
  }
})

// Page metadata
useHead({
  title: 'Color Palette Tool',
  meta: [
    { name: 'description', content: 'Create and manage color palettes from images' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})

// Add this method
function dismissJsonlIndicator() {
  // Just hide the indicator
  jsonlLoaded.value = false
  imagesStore.error = null
}
</script>

<style scoped>
.router-link-active {
  @apply text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30;
}
</style>
