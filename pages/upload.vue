<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Upload Image</h1>
    
    <UiCard class="max-w-2xl">
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Image Name</label>
          <input 
            id="name" 
            v-model="form.name" 
            type="text" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            required
          />
        </div>
        
        <!-- Upload method toggle -->
        <div class="mb-4">
          <div class="flex space-x-4">
            <button 
              type="button" 
              @click="uploadMethod = 'file'"
              class="px-4 py-2 rounded-md"
              :class="uploadMethod === 'file' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700'"
            >
              Upload File
            </button>
            <button 
              type="button" 
              @click="uploadMethod = 'url'"
              class="px-4 py-2 rounded-md"
              :class="uploadMethod === 'url' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-100 text-gray-700'"
            >
              Image URL
            </button>
          </div>
        </div>
        
        <!-- File upload section -->
        <div v-if="uploadMethod === 'file'" class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Image File</label>
          <div 
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center"
            :class="{ 'border-blue-500 bg-blue-50': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
          >
            <div v-if="!form.file && !preview">
              <div class="mx-auto h-12 w-12 text-gray-400">
                <!-- Upload icon -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div class="mt-2 text-center">
                <p class="text-sm text-gray-600">Drag and drop your image here, or</p>
                <label class="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <span>Browse files</span>
                  <input 
                    type="file" 
                    class="hidden" 
                    accept="image/*"
                    @change="handleFileChange"
                  />
                </label>
              </div>
            </div>
            
            <div v-else class="w-full">
              <div class="relative aspect-w-16 aspect-h-9 bg-gray-100 rounded-md overflow-hidden">
                <img 
                  :src="preview" 
                  alt="Preview" 
                  class="object-contain w-full h-full"
                />
              </div>
              <div class="mt-2 flex justify-between items-center">
                <span class="text-sm text-gray-500 truncate">
                  {{ form.file?.name }}
                </span>
                <button 
                  type="button"
                  class="text-sm text-red-600 hover:text-red-800"
                  @click="resetForm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- URL input section -->
        <div v-else class="mb-6">
          <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input 
            id="imageUrl" 
            v-model="form.url" 
            type="url" 
            placeholder="https://example.com/image.jpg"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            required
          />
          
          <!-- URL preview -->
          <div v-if="form.url && preview" class="mt-4">
            <div class="relative aspect-w-16 aspect-h-9 bg-gray-100 rounded-md overflow-hidden">
              <img 
                :src="preview" 
                alt="Preview" 
                class="object-contain w-full h-full"
              />
            </div>
            <div class="mt-2 flex justify-end">
              <button 
                type="button"
                class="text-sm text-red-600 hover:text-red-800"
                @click="resetForm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3">
          <UiButton 
            type="button" 
            variant="secondary"
            to="/"
          >
            Cancel
          </UiButton>
          <UiButton 
            type="submit" 
            variant="primary"
            :disabled="isUploading || (!isValidForm)"
          >
            {{ isUploading ? 'Uploading...' : 'Upload Image' }}
          </UiButton>
        </div>
      </form>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { useImagesStore } from '~/stores/images'
import { useRouter } from 'vue-router'

const router = useRouter()
const imagesStore = useImagesStore()

const uploadMethod = ref('file') // 'file' or 'url'

const form = reactive({
  name: '',
  file: null as File | null,
  url: ''
})

const preview = ref('')
const isDragging = ref(false)
const isUploading = ref(false)

// Computed property to check if form is valid
const isValidForm = computed(() => {
  if (uploadMethod.value === 'file') {
    return form.name && form.file
  } else {
    return form.name && form.url
  }
})

// Handle file selection
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    form.file = input.files[0]
    createPreview()
  }
}

// Handle file drop
const handleFileDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    form.file = event.dataTransfer.files[0]
    createPreview()
  }
}

// Create image preview
const createPreview = () => {
  if (form.file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      preview.value = e.target?.result as string
    }
    reader.readAsDataURL(form.file)
  } else if (form.url) {
    preview.value = form.url
  }
}

// Watch for URL changes to update preview
watch(() => form.url, (newUrl) => {
  if (newUrl) {
    preview.value = newUrl
  } else {
    preview.value = ''
  }
})

// Reset form
const resetForm = () => {
  if (uploadMethod.value === 'file') {
    form.file = null
  } else {
    form.url = ''
  }
  preview.value = ''
}

// Handle form submission
const handleSubmit = async () => {
  if (!isValidForm.value) return
  
  isUploading.value = true
  
  try {
    if (uploadMethod.value === 'file' && form.file) {
      await imagesStore.uploadImage(form.name, form.file)
    } else if (uploadMethod.value === 'url' && form.url) {
      await imagesStore.uploadImageFromUrl(form.name, form.url)
    }
    router.push('/')
  } catch (error) {
    console.error('Error uploading image:', error)
  } finally {
    isUploading.value = false
  }
}
</script>
