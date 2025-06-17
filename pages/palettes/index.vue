<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Color Palettes</h1>
    
    <div class="mb-8">
      <ClientOnly>
        <UiButton 
          class="bg-blue-600 hover:bg-blue-700 text-white"
          @click="navigateToCreate"
        >
          Create New Palette
        </UiButton>
        
        <template #fallback>
          <div class="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
            Create New Palette
          </div>
        </template>
      </ClientOnly>
    </div>
    
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
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="palette in palettes" 
        :key="palette.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden cursor-pointer"
        @click="viewPalette(String(palette.id))"
      >
        <div class="h-12 flex">
          <div 
            v-for="color in palette.colorPalette.slice(0, 6)" 
            :key="typeof color === 'object' && color !== null && 'id' in color ? color.id : (typeof color === 'object' && 'hex' in color ? color.hex : String(color))"
            class="flex-1 h-full"
            :style="{ backgroundColor: typeof color === 'string' ? color : color.hex }"
          ></div>
        </div>
        
        <div class="p-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
            {{ palette.paletteName }}
          </h3>
          <p v-if="palette.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
            {{ palette.description }}
          </p>
          <!-- Removed date display -->
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
