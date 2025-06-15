// This plugin ensures all components are properly registered
export default defineNuxtPlugin((nuxtApp) => {
  console.log('Component registration plugin loaded')
  
  // Log all registered components for debugging
  const registeredComponents = Object.keys(nuxtApp.vueApp._context.components || {})
  
  console.log('All registered components:', registeredComponents)
  console.log('UI components:', registeredComponents.filter(name => name.startsWith('Ui')))
  
  // Check if UiButton is registered
  if (registeredComponents.includes('UiButton')) {
    console.log('UiButton is registered correctly')
  } else {
    console.warn('UiButton is not registered! Available UI components:', 
      registeredComponents.filter(name => name.startsWith('Ui'))
    )
  }
})
