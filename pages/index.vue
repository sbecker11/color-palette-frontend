<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Images</h1>
        <p class="text-gray-600 mt-1">Manage your image collection and create color palettes</p>
      </div>
      <NuxtLink to="/upload" class="btn-primary">
        <PlusIcon class="w-5 h-5 mr-2" />
        Upload Image
      </NuxtLink>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <div class="relative max-w-md">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search images..."
          class="form-input pl-10"
          @input="debouncedSearch"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="imagesStore.isLoading && !imagesStore.hasImages" class="flex justify-center py-12">
      <div class="loading-spinner w-8 h-8"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!imagesStore.hasImages && !imagesStore.isLoading" class="text-center py-12">
      <PhotoIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No images found</h3>
      <p class="text-gray-600 mb-6">Get started by uploading your first image</p>
      <NuxtLink to="/upload" class="btn-primary">
        Upload Image
      </NuxtLink>
    </div>

    <!-- Images Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ImageCard
        v-for="image in imagesStore.images"
        :key="image.id"
        :image="image"
        @click="navigateToImage(image.id)"
        @delete="handleDeleteImage"
      />
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="imagesStore.pagination.totalPages > 1"
      :current-page="imagesStore.pagination.currentPage"
      :total-pages="imagesStore.pagination.totalPages"
      :total-count="imagesStore.pagination.totalCount"
      @page-change="handlePageChange"
      class="mt-8"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-model="showDeleteModal"
      title="Delete Image"
      :message="`Are you sure you want to delete '${imageToDelete?.name}'? This will also delete all associated color palettes.`"
      confirm-text="Delete"
      confirm-class="btn-danger"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, MagnifyingGlassIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import type { Image } from '~/types/image'

// Store
const imagesStore = useImagesStore()

// Reactive data
const searchQuery = ref('')
const showDeleteModal = ref(false)
const imageToDelete = ref<Image | null>(null)

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  handleSearch()
}, 500)

// Methods
const handleSearch = async () => {
  await imagesStore.fetchImages(1, searchQuery.value)
}

const handlePageChange = async (page: number) => {
  await imagesStore.fetchImages(page, searchQuery.value)
}

const navigateToImage = (imageId: string) => {
  navigateTo(`/images/${imageId}`)
}

const handleDeleteImage = (image: Image) => {
  imageToDelete.value = image
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (imageToDelete.value) {
    try {
      await imagesStore.deleteImage(imageToDelete.value.id)
      // Show success toast
      showToast('Image deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting image:', error)
      showToast('Failed to delete image', 'error')
    } finally {
      showDeleteModal.value = false
      imageToDelete.value = null
    }
  }
}

// Toast helper
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // Implementation would depend on your toast library
  console.log(`${type.toUpperCase()}: ${message}`)
}

// Lifecycle
onMounted(async () => {
  if (!imagesStore.hasImages) {
    await imagesStore.fetchImages()
  }
})

// SEO
useHead({
  title: 'Images - Color Palette Tool',
  meta: [
    { name: 'description', content: 'Browse and manage your image collection for color palette creation' }
  ]
})
</script>
