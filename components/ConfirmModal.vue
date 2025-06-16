<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to perform this action?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  confirmVariant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'danger'].includes(value)
  },
  colorData: {
    type: Object,
    default: null
  },
  // Add new props for positioning
  position: {
    type: Object as () => { x: number | null, y: number | null },
    default: () => ({ x: null, y: null })
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const confirm = () => {
  emit('confirm')
  close()
}

const close = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

// Compute modal position styles with proper typing
const modalStyle = computed<CSSProperties>(() => {
  if (props.position.x === null || props.position.y === null) {
    return {}
  }
  
  return {
    position: 'absolute' as const, // Type assertion to specific CSS position value
    left: `${props.position.x}px`,
    top: `${props.position.y}px`,
    transform: 'translate(-100%, -100%)',
    margin: '0'
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay with brightness 0.75 -->
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm backdrop-brightness-75 transition-opacity" @click="close"></div>

          <!-- Modal panel with positioning -->
          <div 
            class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-lg sm:w-full"
            :style="modalStyle"
          >
            <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                  <!-- Warning icon -->
                  <svg class="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                    {{ title }}
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ message }}
                    </p>
                    
                    <!-- Color preview section with enhanced display -->
                    <div v-if="colorData" class="mt-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div class="flex items-center space-x-3">
                        <div 
                          class="w-12 h-12 rounded-md shadow-inner" 
                          :style="{ backgroundColor: colorData.hex }"
                        ></div>
                        <div class="flex-1">
                          <p v-if="colorData.name" class="font-medium text-gray-900 dark:text-gray-100">{{ colorData.name }}</p>
                          <p class="text-sm text-gray-600 dark:text-gray-300 font-mono">{{ colorData.hex }}</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            <!-- Handle different RGB formats -->
                            <template v-if="Array.isArray(colorData.rgb)">
                              rgb({{ colorData.rgb[0] }}, {{ colorData.rgb[1] }}, {{ colorData.rgb[2] }})
                            </template>
                            <template v-else-if="typeof colorData.rgb === 'string'">
                              {{ colorData.rgb }}
                            </template>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button 
                type="button" 
                :class="[
                  'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm',
                  confirmVariant === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-600' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-600'
                ]"
                @click="confirm"
              >
                {{ confirmText }}
              </button>
              <button 
                type="button" 
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                @click="close"
              >
                {{ cancelText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
