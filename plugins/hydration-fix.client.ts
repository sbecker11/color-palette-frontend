// This plugin runs only on the client side
export default defineNuxtPlugin(() => {
  console.log('Hydration fix plugin loaded')
  
  // You can add any client-side specific initialization here
  // This helps ensure client-side rendering matches server-side rendering
})