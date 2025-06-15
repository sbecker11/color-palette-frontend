<!-- Make sure this file exists at this exact path -->
<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <p class="text-lg">Loading image...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>{{ error }}</p>
      <button @click="goBack" class="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
        Go Back
      </button>
    </div>
    
    <div v-else-if="image" class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">{{ image.name }}</h1>
        <div class="mb-6">
          <img :src="image.url" :alt="image.name" class="w-full h-auto rounded-lg" />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h2 class="text-lg font-semibold mb-2">Image Details</h2>
            <ul class="space-y-1 text-sm">
              <li><span class="font-medium">Dimensions:</span> {{ image.width }}x{{ image.height }}</li>
              <li><span class="font-medium">File Type:</span> {{ image.fileType }}</li>
              <li><span class="font-medium">File Size:</span> {{ formatFileSize(image.fileSize) }}</li>
              <li><span class="font-medium">Created:</span> {{ formatDate(image.createdAt) }}</li>
            </ul>
          </div>
        </div>
        
        <div class="flex space-x-4">
          <button @click="goBack" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
            Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useImagesStore } from '~/stores/images'

const route = useRoute()
const router = useRouter()
const imagesStore = useImagesStore()

const image = ref(null)
const loading = ref(true)
const error = ref(null)

// Format file size
function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format date
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

// Go back to previous page
function goBack() {
  router.push('/images')
}

// Load image data
onMounted(async () => {
  try {
    const imageId = route.params.id
    console.log('Loading image with ID:', imageId)
    
    if (!imageId) {
      throw new Error('Image ID is missing')
    }
    
    const fetchedImage = await imagesStore.getImage(imageId.toString())
    console.log('Fetched image:', fetchedImage)
    image.value = fetchedImage
  } catch (err) {
    console.error('Error loading image:', err)
    error.value = 'Failed to load image. Please try again.'
  } finally {
    loading.value = false
  }
})
</script>
