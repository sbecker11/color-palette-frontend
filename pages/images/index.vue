<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Image Gallery</h1>
      
      <div class="flex space-x-3">
        <ClientOnly>
          <!-- View All Palettes button -->
          <UiButton 
            class="bg-green-600 hover:bg-green-700 text-white mr-2"
            @click="navigateToHome"
          >
            View All Palettes
          </UiButton>
          
          <UiButton 
            class="bg-blue-600 hover:bg-blue-700 text-white"
            @click="navigateToUpload"
          >
            Upload New Image
          </UiButton>
          
          <!-- Fallback content for SSR -->
          <template #fallback>
            <div class="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
              Upload New Image
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
    
    <!-- Display images if available -->
    <div v-if="imagesStore.hasImages" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="image in imagesStore.images" :key="image.id" class="overflow-hidden rounded-lg">
        <!-- Make the entire image clickable -->
        <div class="relative aspect-w-16 aspect-h-9 cursor-pointer" @click="viewImage(image.id)">
          <img :src="image.url" :alt="image.name" class="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity">
          
          <!-- Overlay with image name at the bottom -->
          <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <h3 class="text-lg font-semibold truncate">{{ image.name }}</h3>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-else-if="imagesStore.isLoading" class="text-center py-12">
      <p class="text-gray-600">Loading images...</p>
    </div>
    
    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold mb-2">No images found</h2>
      <p class="text-gray-600 mb-6">Upload your first image to get started</p>
      <UiButton 
        class="bg-blue-600 hover:bg-blue-700 text-white"
        @click="navigateToUpload"
      >
        Upload Image
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useImagesStore } from '~/stores/images'

const router = useRouter()
const imagesStore = useImagesStore()

// Fetch images when the component is mounted
onMounted(async () => {
  console.log('Images page mounted');
  
  try {
    await imagesStore.fetchImages();
    console.log('STORE IMAGES COUNT:', imagesStore.images.length);
  } catch (error) {
    console.error('Error with store fetch:', error);
  }
});

// Add navigation to home/palettes
const navigateToHome = () => {
  router.push('/')
}

const navigateToUpload = () => {
  router.push('/upload')
}

const viewImage = (id: string) => {
  router.push(`/images/${id}`)
}

// Format date with error handling and flexible parsing
const formatDate = (dateString: string | number) => {
  if (!dateString) return 'Unknown'
  
  try {
    // If it's a number, treat it as a timestamp
    const date = typeof dateString === 'number' 
      ? new Date(dateString) 
      : new Date(dateString)
    
    // Check if date is valid before formatting
    if (isNaN(date.getTime())) {
      console.warn('Invalid date format received:', dateString)
      return 'Invalid date format'
    }
    
    return date.toLocaleDateString()
  } catch (e) {
    console.error('Error formatting date:', e, dateString)
    return 'Invalid date format'
  }
}
</script>
