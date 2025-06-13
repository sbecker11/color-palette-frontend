<template>
  <button
    :class="[
      'btn',
      variant ? `btn-${variant}` : 'btn-primary',
      size ? `btn-${size}` : '',
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'outline', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: '',
    validator: (value: string) => ['', 'sm', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>