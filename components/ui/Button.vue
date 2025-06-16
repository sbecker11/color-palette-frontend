<template>
  <component
    :is="componentType"
    :class="[
      'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
      sizeClasses,
      variantClasses,
      props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    ]"
    :disabled="props.disabled"
    :to="props.to"
    :href="props.href"
    :type="props.type"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveComponent } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'danger', 'link', 'disabled', 'outline'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  to: {
    type: String,
    default: undefined
  },
  href: {
    type: String,
    default: undefined
  },
  type: {
    type: String,
    default: 'button'
  }
})

const componentType = computed(() => {
  if (props.to) {
    return resolveComponent('NuxtLink')
  }
  if (props.href) {
    return 'a'
  }
  return 'button'
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm'
    case 'lg':
      return 'px-5 py-3 text-lg'
    default:
      return 'px-4 py-2 text-base'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
    case 'secondary':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500'
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    case 'link':
      return 'bg-transparent text-blue-600 hover:text-blue-800 hover:underline focus:ring-blue-500 px-0'
    case 'outline':
      return 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
    case 'disabled':
      return 'bg-gray-300 text-gray-500'
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
  }
})
</script>
