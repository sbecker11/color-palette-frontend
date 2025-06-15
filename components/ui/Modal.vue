<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center" @click.self="$emit('update:modelValue', false)">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-auto">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
        <button @click="$emit('update:modelValue', false)" class="text-gray-400 hover:text-gray-500">
          <span class="sr-only">Close</span>
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-4">
        <slot></slot>
      </div>
      <div v-if="$slots.footer" class="p-4 border-t border-gray-200">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>