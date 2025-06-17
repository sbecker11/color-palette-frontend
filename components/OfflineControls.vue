<template>
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
          Connectivity Mode
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ offlineMode ? 'Working offline. Changes saved locally.' : 'Connected to server. Changes saved to server.' }}
          <span v-if="hasPendingChanges" class="text-amber-600 dark:text-amber-400">
            ({{ pendingCount }} pending {{ pendingCount === 1 ? 'change' : 'changes' }})
          </span>
        </p>
        <!-- Add unsaved changes indicator -->
        <p v-if="hasUnsavedChanges" class="text-sm text-red-500 dark:text-red-400 mt-1">
          <span class="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
          Unsaved changes in current palette
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <button
          v-if="hasPendingChanges && !offlineMode"
          @click="syncChanges"
          class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          :disabled="syncing"
        >
          {{ syncing ? 'Syncing...' : 'Sync Changes' }}
        </button>
        
        <label class="inline-flex items-center cursor-pointer">
          <span class="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">Server</span>
          <div class="relative">
            <input type="checkbox" v-model="offlineMode" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </div>
          <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Local</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePaletteStore } from '~/stores/palettes'
import { storeToRefs } from 'pinia'

const paletteStore = usePaletteStore()
const syncing = ref(false)

const offlineMode = computed({
  get: () => paletteStore.offlineMode,
  set: (value) => paletteStore.toggleOfflineMode(value)
})

const hasPendingChanges = computed(() => paletteStore.hasPendingChanges)
const pendingCount = computed(() => localPendingChanges.value.length || 0)

// Add this to access localPendingChanges directly
const { localPendingChanges } = storeToRefs(paletteStore)

// Add this to check for unsaved changes
const hasUnsavedChanges = computed(() => paletteStore.hasUnsavedChanges)

async function syncChanges() {
  syncing.value = true
  await paletteStore.syncPendingChanges()
  syncing.value = false
}
</script>
