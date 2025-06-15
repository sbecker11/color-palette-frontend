<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Color Palette Generator</h1>
    
    <div class="mb-8">
      <ClientOnly>
        <!-- Use the component with the correct name -->
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
    
    <!-- Display images if available -->
    <div v-if="imagesStore.hasImages" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="image in imagesStore.images" :key="image.id" class="bg-white rounded-lg shadow-md overflow-hidden">
        <img :src="image.url" :alt="image.name" class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">{{ image.name }}</h3>
          <p class="text-gray-600 text-sm">
            Created: {{ formatDate(image.createdAt) }}
          </p>
          <div class="mt-4 flex justify-end">
            <UiButton 
              class="bg-blue-600 hover:bg-blue-700 text-white mr-2"
              @click="viewImage(image.id)"
            >
              View
            </UiButton>
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
  console.log('Index page mounted');
  
  // Direct fetch to see what the API returns
  try {
    const response = await fetch('/api/images?page=1&limit=12');
    const data = await response.json();
    console.log('API RESPONSE DATA:', data);
  } catch (error) {
    console.error('Error fetching directly:', error);
  }
  
  // Then try the store method
  try {
    await imagesStore.fetchImages();
    console.log('STORE IMAGES COUNT:', imagesStore.images.length);
    console.log('STORE IMAGES DATA:', imagesStore.images);
  } catch (error) {
    console.error('Error with store fetch:', error);
  }
});

const navigateToUpload = () => {
  router.push('/upload')
}

const viewImage = (id: string) => {
  // Fix the path to use the correct route
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
