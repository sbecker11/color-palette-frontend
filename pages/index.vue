<template>
  <div class="w-full min-h-screen box-border border-[30px] border-solid border-white dark:border-[#111827] relative">
    <!-- Header Row -->
    <div class="flex flex-row items-center justify-between mb-6 bg-white dark:bg-[#111827]">
      <h1 class="text-3xl font-bold">Color Palette Generator</h1>
      <div class="flex space-x-3">
        <ClientOnly>
          <UiButton 
            class="bg-blue-600 hover:bg-blue-700 text-white"
            @click="navigateToImages"
          >
            View Images
          </UiButton>
          <UiButton 
            class="bg-green-600 hover:bg-green-700 text-white"
            @click="navigateToCreatePalette"
          >
            Create New Palette
          </UiButton>
          <!-- Fallback content for SSR -->
          <template #fallback>
            <div class="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
              View Images
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
    <!-- Palette List Container -->
    <div class="flex flex-col flex-1 space-y-4">
      <div v-if="loading" class="flex justify-center my-8">
        <p class="text-gray-600 dark:text-gray-400">Loading palettes...</p>
      </div>
      <div v-else-if="error" class="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg my-4">
        <p class="text-red-700 dark:text-red-400">{{ error }}</p>
      </div>
      <div v-else-if="palettes.length === 0" class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 class="text-xl font-semibold mb-2">No palettes found</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Create your first palette to get started</p>
        <UiButton 
          class="bg-blue-600 hover:bg-blue-700 text-white"
          @click="navigateToCreatePalette"
        >
          Create Your First Palette
        </UiButton>
      </div>
      <template v-else>
        <div 
          v-for="palette in palettes" 
          :key="palette.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
        >
          <div class="p-4">
            <h3 
              class="font-medium text-lg mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
              @click="viewPalette(String(palette.id))"
            >
              {{ palette.name }}
            </h3>
            <p v-if="palette.description" class="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {{ palette.description }}
            </p>
            <div class="flex h-8 rounded-md overflow-hidden mb-3 cursor-pointer" @click="viewPalette(String(palette.id))">
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
                @click="viewPalette(String(palette.id))" 
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePaletteStore } from '~/stores/palettes'

const router = useRouter()
const palettesStore = usePaletteStore()

const loading = ref(true)
const error = ref<string | null>(null)

// Get palettes from store
const palettes = computed(() => palettesStore.palettes)

// Fetch palettes when the component is mounted
onMounted(async () => {
  try {
    await palettesStore.fetchPalettes()
  } catch (err: any) {
    console.error('Error fetching palettes:', err)
    error.value = 'Failed to load palettes. Please try again.'
  } finally {
    loading.value = false
  }
})

const navigateToImages = () => {
  router.push('/images')
}

const navigateToCreatePalette = () => {
  router.push('/palettes/create')
}

const viewPalette = (id: string) => {
  router.push(`/palettes/${id}`)
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
