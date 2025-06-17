<template>
  <div class="w-full min-h-screen box-border border-[30px] border-solid border-white dark:border-[#111827] relative">
    <!-- Header Row -->
    <div class="flex flex-row items-center justify-between mb-6 bg-white dark:bg-[#111827]">
      <h1 class="text-3xl font-bold">Color Palette Generator</h1>
      <div class="flex space-x-3">
        <ClientOnly>
          <UiButton 
            class="bg-blue-600 hover:bg-blue-700 text-white"
            @click="openFilePicker"
          >
            Upload Palettes
          </UiButton>
          <UiButton 
            class="bg-green-600 hover:bg-green-700 text-white"
            @click="navigateToCreatePalette"
          >
            Create New Palette
          </UiButton>
          <UiButton
            class="bg-gray-600 hover:bg-gray-700 text-white"
            @click="openJsonlFilePicker"
          >
            Load image_metadata.jsonl
          </UiButton>
          <!-- Fallback content for SSR -->
          <template #fallback>
            <div class="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
              Upload Palettes
            </div>
          </template>
        </ClientOnly>
        <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="handleFileChange" />
        <input ref="jsonlInput" type="file" accept=".jsonl" class="hidden" @change="handleJsonlFileChange" />
      </div>
    </div>
    <div v-if="jsonlLoaded" class="mb-4 p-2 bg-green-100 text-green-800 rounded">image_metadata.jsonl loaded ({{ jsonlData.length }} records)</div>
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
              {{ palette.paletteName }}
            </h3>
            <p v-if="palette.description" class="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {{ palette.description }}
            </p>
            <div class="flex h-8 rounded-md overflow-hidden mb-3 cursor-pointer" @click="viewPalette(String(palette.id))">
              <div 
                v-for="(color, idx) in palette.colorPalette" 
                :key="typeof color === 'object' && color !== null && 'id' in color ? color.id : (typeof color === 'object' && 'hex' in color ? color.hex : color || idx)" 
                class="flex-1 h-full" 
                :style="{ backgroundColor: typeof color === 'string' ? color : color.hex }"
                :title="String(typeof color === 'string' ? color : (color.name || color.hex || color))"
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
    <div v-if="jsonlLoaded" class="mt-8">
      <button @click="showMeta = !showMeta" class="mb-2 px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
        {{ showMeta ? 'Hide' : 'Show' }} Loaded Image Metadata ({{ jsonlData.length }})
      </button>
      <div v-if="showMeta" class="space-y-4">
        <div v-for="(meta, idx) in jsonlData" :key="meta.id || idx" class="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <div class="flex flex-col md:flex-row md:items-center md:space-x-8">
            <div class="flex-1">
              <div class="font-semibold text-lg mb-1">{{ meta.paletteName || meta.name || meta['palette name'] || 'Untitled Palette' }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span class="font-medium">Image URL:</span> <a :href="meta.uploadedURL || meta.imageURL || meta['image URL']" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">{{ meta.uploadedURL || meta.imageURL || meta['image URL'] }}</a>
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span class="font-medium">Cached File Path:</span> {{ meta.uploadedFilePath || meta['image Cached filepath'] || '' }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span class="font-medium">Width:</span> {{ meta.width || meta['width'] || '?' }}
                <span class="ml-4 font-medium">Height:</span> {{ meta.height || meta['height'] || '?' }}
                <span class="ml-4 font-medium">Format:</span> {{ meta.format || meta['format'] || '?' }}
                <span class="ml-4 font-medium">File Size:</span> {{ meta.fileSizeBytes || meta['file size'] || '?' }} bytes
              </div>
            </div>
            <div class="flex-1 flex flex-col items-end">
              <div class="flex h-8 rounded-md overflow-hidden mb-1 w-full max-w-xs">
                <div v-for="(color, cidx) in (meta.colorPalette || meta.colors || meta['palette hexRGB colors'] || [])" :key="color.id || color.hex || color || cidx" class="flex-1 h-full" :style="{ backgroundColor: typeof color === 'string' ? color : color.hex }" :title="String(typeof color === 'string' ? color : (color.name || color.hex || color))" />
              </div>
            </div>
          </div>
        </div>
      </div>
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

// File input refs
const fileInput = ref<HTMLInputElement | null>(null)
const jsonlInput = ref<HTMLInputElement | null>(null)

// State for loaded JSONL data
const jsonlData = ref<any[]>([])
const jsonlLoaded = ref(false)
const showMeta = ref(false)

function openFilePicker() {
  fileInput.value?.click()
}

function openJsonlFilePicker() {
  jsonlInput.value?.click()
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const json = JSON.parse(e.target?.result as string)
      let palette: any = { ...json }
      // Always use new format
      palette = {
        ...json,
        paletteName: json.paletteName || json.name || 'Untitled Palette',
        colorPalette: Array.isArray(json.colorPalette) ? [...json.colorPalette] : (Array.isArray(json.colors) ? [...json.colors] : []),
        id: json.id || Date.now().toString(),
      }
      // Ensure unique paletteName
      const existingNames = palettes.value.map(p => p.paletteName)
      let baseName = palette.paletteName
      let uniqueName = baseName
      let copyIndex = 1
      while (existingNames.includes(uniqueName)) {
        uniqueName = `${baseName} copy${copyIndex > 1 ? ' ' + copyIndex : ''}`
        copyIndex++
      }
      palette.paletteName = uniqueName
      palettesStore.palettes.push(palette)
    } catch (err) {
      alert('Invalid palette.json file or upload failed.')
    }
    input.value = ''
  }
  reader.readAsText(file)
}

function handleJsonlFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string
      // Parse JSONL: one JSON object per line
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)
      const palettesFromJsonl = lines.map(line => {
        const obj = JSON.parse(line)
        // Map fields to new palette format
        return {
          id: obj.id || Date.now().toString() + Math.random().toString(36).slice(2),
          paletteName: obj.paletteName || obj.name || obj['palette name'] || 'Untitled Palette',
          colorPalette: obj.colorPalette || obj.colors || obj['palette hexRGB colors'] || [],
          createdDateTime: obj.createdDateTime || obj.created_at || obj.createdAt || new Date().toISOString(),
          uploadedURL: obj.uploadedURL || obj.imageURL || obj['image URL'] || '',
          uploadedFilePath: obj.uploadedFilePath || obj['image Cached filepath'] || '',
          cachedFilePath: obj.cachedFilePath || '',
          width: obj.width || obj['width'] || 0,
          height: obj.height || obj['height'] || 0,
          format: obj.format || obj['format'] || '',
          fileSizeBytes: obj.fileSizeBytes || obj['file size'] || 0,
          description: obj.description || obj['description'] || '',
        }
      })
      // Ensure unique palette names
      const existingNames = palettes.value.map(p => p.paletteName)
      palettesFromJsonl.forEach(palette => {
        let baseName = palette.paletteName
        let uniqueName = baseName
        let copyIndex = 1
        while (existingNames.includes(uniqueName)) {
          uniqueName = `${baseName} copy${copyIndex > 1 ? ' ' + copyIndex : ''}`
          copyIndex++
        }
        palette.paletteName = uniqueName
        existingNames.push(uniqueName)
        palettesStore.palettes.push(palette)
      })
      jsonlData.value = palettesFromJsonl
      jsonlLoaded.value = true
    } catch (err) {
      alert('Invalid .jsonl file or load failed.')
      jsonlLoaded.value = false
      jsonlData.value = []
    }
    input.value = ''
  }
  reader.readAsText(file)
}

// Export palette as JSON file in the new format
function exportPalette(palette: any) {
  const exportData = {
    createdDateTime: palette.createdDateTime || new Date().toISOString(),
    uploadedURL: palette.uploadedURL || '',
    uploadedFilePath: palette.uploadedFilePath || null,
    cachedFilePath: palette.cachedFilePath || '',
    width: palette.width || 0,
    height: palette.height || 0,
    format: palette.format || '',
    fileSizeBytes: palette.fileSizeBytes || 0,
    colorPalette: palette.colorPalette || [],
    paletteName: palette.paletteName || 'Untitled Palette',
  }
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${exportData.paletteName.replace(/\s+/g, '_').toLowerCase()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

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
