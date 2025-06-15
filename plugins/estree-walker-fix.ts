// This plugin is a workaround for the estree-walker package issue
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  // This plugin creates a shim for estree-walker
  // The actual fix is applied in the postinstall script
  console.log('Estree-walker fix plugin loaded')
})
