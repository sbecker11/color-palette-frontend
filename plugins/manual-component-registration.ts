import { defineNuxtPlugin } from '#app'
// Import using the correct path for runtime
import Button from '../components/ui/Button.vue'

export default defineNuxtPlugin((nuxtApp) => {
  console.log('Manual component registration plugin loaded')
  
  // Only register if not already registered
  if (!Object.keys(nuxtApp.vueApp._context.components || {}).includes('UiButton')) {
    // Manually register the Button component
    nuxtApp.vueApp.component('UiButton', Button)
    console.log('UiButton manually registered')
  } else {
    console.log('UiButton already registered, skipping manual registration')
  }
  
  // Log after registration
  const registeredComponents = Object.keys(nuxtApp.vueApp._context.components || {})
  console.log('After registration check, components:', registeredComponents)
})
