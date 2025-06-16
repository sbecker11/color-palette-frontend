<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Image Gallery</h1>
      <UiButton 
        @click="router.push('/upload')" 
        variant="primary"
      >
        Upload New Image
      </UiButton>
    </div>
    
    <!-- Loading state -->
    <div v-if="imagesStore.isLoading" class="flex justify-center items-center h-64">
      <p class="text-xl">Loading images...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="imagesStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>{{ imagesStore.error }}</p>
    </div>
    
    <!-- Image grid -->
    <div v-else-if="imagesStore.hasImages" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div 
        v-for="image in imagesStore.images" 
        :key="image.id" 
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
      >
        <div class="aspect-w-16 aspect-h-12 bg-gray-100">
          <img 
            :src="image.url" 
            :alt="image.name" 
            class="object-cover w-full h-full cursor-pointer"
            @click="viewImage(image.id)"
          />
        </div>
        <div class="p-4">
          <h3 class="font-medium text-gray-900 truncate">{{ image.name }}</h3>
          <!-- Remove date display since created_at is not in API -->
          
          <!-- Remove color preview section since colors aren't in API -->
          
          <div class="mt-3 flex justify-end">
            <UiButton 
              size="sm"
              variant="secondary"
              @click="viewImage(image.id)"
            >
              View
            </UiButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold mb-2">No images found</h2>
      <p class="text-gray-600 mb-6">Upload your first image to get started</p>
      <UiButton 
        variant="primary"
        @click="router.push('/upload')"
      >
        Upload Image
      </UiButton>
    </div>
    
    <!-- Pagination -->
    <div v-if="imagesStore.hasImages && imagesStore.totalImages > imagesStore.itemsPerPage" class="mt-8 flex justify-center">
      <div class="flex space-x-2">
        <UiButton 
          variant="secondary" 
          size="sm"
          :disabled="imagesStore.currentPage === 1"
          @click="changePage(imagesStore.currentPage - 1)"
        >
          Previous
        </UiButton>
        
        <div v-for="page in totalPages" :key="page" class="inline-block">
          <UiButton 
            variant="secondary" 
            size="sm"
            :class="page === imagesStore.currentPage ? 'bg-blue-100 text-blue-700' : ''"
            @click="changePage(page)"
          >
            {{ page }}
          </UiButton>
        </div>
        
        <UiButton 
          variant="secondary" 
          size="sm"
          :disabled="imagesStore.currentPage === totalPages"
          @click="changePage(imagesStore.currentPage + 1)"
        >
          Next
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useImagesStore } from '~/stores/images'
import { useRouter } from 'vue-router'

const router = useRouter()
const imagesStore = useImagesStore()

// Fetch images when the component is mounted
onMounted(async () => {
  try {
    await imagesStore.fetchImages()
  } catch (error) {
    console.error('Failed to fetch images:', error)
  }
})

// Computed property for total pages
const totalPages = computed(() => {
  return Math.ceil(imagesStore.totalImages / imagesStore.itemsPerPage)
})

// Function to change page
const changePage = async (page: number) => {
  try {
    await imagesStore.fetchImages({ page, limit: imagesStore.itemsPerPage })
  } catch (error) {
    console.error('Failed to fetch images:', error)
  }
}

// Function to view image details - ensure correct path
const viewImage = (id: string) => {
  router.push(`/images/${id}`)
}

// Format date function can stay, but we won't use it for image.created_at
const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>
