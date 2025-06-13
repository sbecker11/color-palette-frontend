// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001/api/v1'
    }
  },

  // Auto-import components
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // Build configuration
  build: {
    transpile: ['vue-toastification']
  },

  // Development server configuration
  devServer: {
    port: 3000
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true
  },

  // Vitest configuration for testing
  vitest: {
    environment: 'happy-dom'
  }
})
