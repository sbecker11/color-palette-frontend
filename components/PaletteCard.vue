<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden cursor-pointer">
    <div class="h-12 flex">
      <div 
        v-for="color in palette.colorPalette.slice(0, 6)" 
        :key="typeof color === 'object' && color !== null && 'id' in color ? color.id : (typeof color === 'object' && 'hex' in color ? color.hex : color)"
        class="flex-1 h-full"
        :style="{ backgroundColor: typeof color === 'string' ? color : color.hex }"
      ></div>
    </div>
    
    <div class="p-4">
      <h3 class="text-lg font-medium text-gray-900 truncate">
        {{ palette.paletteName }}
      </h3>
      <p v-if="palette.description" class="text-sm text-gray-500 mt-1 truncate">
        {{ palette.description }}
      </p>
      <!-- Remove date display -->
      <div class="flex flex-wrap mt-3 gap-1">
        <div 
          v-for="color in palette.colorPalette.slice(0, 5)" 
          :key="typeof color === 'object' && color !== null && 'id' in color ? color.id : (typeof color === 'object' && 'hex' in color ? color.hex : color)"
          class="w-6 h-6 rounded-full"
          :style="{ backgroundColor: typeof color === 'string' ? color : color.hex }"
          :title="typeof color === 'string' ? color : color.hex"
        ></div>
        <div v-if="palette.colorPalette.length > 5" class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
          +{{ palette.colorPalette.length - 5 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Palette } from '~/types/palette'
import { usePaletteStore } from '~/stores/palettes'

defineProps({
  palette: {
    type: Object as PropType<Palette>,
    required: true
  }
})
</script>
