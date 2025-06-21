<template>
  <div 
    v-if="showIndicator" 
    class="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-md z-50"
  >
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg v-if="isLoaded" class="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="error" class="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <div v-else-if="isLoading" class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <svg v-else class="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">
          {{ isLoaded ? 'JSONL Data Loaded' : error ? 'Error Loading JSONL' : isLoading ? 'Loading JSONL Data...' : 'JSONL Data Available' }}
        </h3>
        <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <p v-if="isLoaded">
            Successfully loaded data from JSONL file.
          </p>
          <p v-else-if="error" class="text-red-600 dark:text-red-400">
            {{ error }}
          </p>
          <p v-else-if="isLoading">
            Loading data from JSONL file...
          </p>
          <p v-else>
            JSONL file is available for loading: <br>
            <span class="text-xs">{{ filePath }}</span>
          </p>
        </div>
        <div class="mt-2 flex space-x-2">
          <button 
            v-if="!isLoaded && !isLoading" 
            @click="$emit('load')"
            class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-100 dark:bg-blue-800 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Load Data
          </button>
          <button 
            @click="$emit('close')"
            class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  isLoaded: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  filePath: {
    type: String,
    default: ''
  },
  showIndicator: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['load', 'close'])

watch(() => props.isLoaded, (val) => {
  if (val) {
    setTimeout(() => emit('close'), 1000)
  }
})
</script>
