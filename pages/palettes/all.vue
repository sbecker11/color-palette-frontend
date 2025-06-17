<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">All Palettes</h1>
    
    <div v-if="loading" class="flex justify-center my-8">
      <p class="text-gray-600 dark:text-gray-400">Loading palettes...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg my-4">
      <p class="text-red-700 dark:text-red-400">{{ error }}</p>
    </div>
    
    <div v-else-if="palettes.length === 0" class="text-center my-12">
      <p class="text-gray-600 dark:text-gray-400 mb-4">No palettes found</p>
      <UiButton 
        class="bg-blue-600 hover:bg-blue-700 text-white"
        @click="navigateToCreate"
      >
        Create Your First Palette
      </UiButton>
    </div>
    
    <div v-else class="max-w-2xl mx-auto space-y-4">
      <!-- Single column of palette cards -->
      <div 
        v-for="palette in palettes" 
        :key="palette.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
      >
        <div class="p-4">
          <h3 class="font-medium text-lg mb-2">{{ palette.name }}</h3>
          <p v-if="palette.description" class="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {{ palette.description }}
          </p>
          
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
              @click="viewPalette(String(palette.id))" 
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const navigateToCreate = () => {
  router.push('/palettes/create')
}

const viewPalette = (id: string) => {
  router.push(`/palettes/${id}`)
}
</script>