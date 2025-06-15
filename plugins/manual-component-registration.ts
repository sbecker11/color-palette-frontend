import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  console.log('Manual component registration plugin loaded')
  
  // Check if components are registered
  console.log('Components before manual registration:', Object.keys(nuxtApp.vueApp._context.components))
  
  // We'll use dynamic import to avoid the error
  import('~/components/ui/Modal.vue').then((UiModal) => {
    if (!nuxtApp.vueApp._context.components['UiModal']) {
      console.log('Manually registering UiModal component')
      nuxtApp.vueApp.component('UiModal', UiModal.default)
    } else {
      console.log('UiModal already registered, skipping manual registration')
    }
    
    // Check if components are registered after import
    console.log('After registration check, components:', Object.keys(nuxtApp.vueApp._context.components))
  }).catch(err => {
    console.error('Failed to import UiModal component:', err)
  })
})
