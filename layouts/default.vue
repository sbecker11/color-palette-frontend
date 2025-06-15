<template>
  <div class="min-h-screen transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
    <nav class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex-shrink-0 flex items-center">
              <span class="text-xl font-bold text-primary-600 dark:text-primary-400">Color Palette Tool</span>
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-4">
            <NuxtLink 
              to="/" 
              class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30': route.path === '/' }"
            >
              Images
            </NuxtLink>
            <NuxtLink 
              to="/upload" 
              class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30': route.path === '/upload' }"
            >
              Upload
            </NuxtLink>
            <NuxtLink 
              to="/design-system" 
              class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="{ 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30': route.path === '/design-system' }"
            >
              Design System
            </NuxtLink>
            
            <!-- Dark mode toggle -->
            <UiDarkModeToggle />
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Add the mock data indicator -->
    <MockDataIndicator />
  </div>
</template>

<script setup lang="ts">
// Import the useRoute composable
import { useRoute } from 'vue-router'

// Get the current route
const route = useRoute()

// Page metadata
useHead({
  title: 'Color Palette Tool',
  meta: [
    { name: 'description', content: 'Create and manage color palettes from images' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>

<style scoped>
.router-link-active {
  @apply text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30;
}
</style>
