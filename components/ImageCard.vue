<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="relative aspect-w-16 aspect-h-9 bg-gray-100">
      <NuxtLink :to="`/images/${image.id}`">
        <img 
          :src="image.url" 
          :alt="image.name"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </NuxtLink>
    </div>
    <div class="p-4">
      <h3 class="text-lg font-medium text-gray-900 truncate">
        {{ image.name }}
      </h3>
      <p class="text-sm text-gray-500 mt-1">
        ID: {{ image.id }}
      </p>
      <div class="mt-4 flex justify-between">
        <NuxtLink 
          :to="`/images/${image.id}`"
          class="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View Details
        </NuxtLink>
        <button 
          @click="$emit('delete', image)"
          class="text-sm font-medium text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Image } from '~/types/image'

defineProps({
  image: {
    type: Object as PropType<Image>,
    required: true
  }
})

defineEmits(['delete'])

// Format date with error handling
function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown'
  
  try {
    const date = new Date(dateString)
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date format'
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    console.error('Error formatting date:', e, dateString)
    return 'Invalid date format'
  }
}
</script>
