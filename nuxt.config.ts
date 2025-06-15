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

  // Auto-import components - updated configuration
  components: [
    {
      path: '~/components/ui',
      prefix: 'Ui',
      global: true,
    },
    {
      path: '~/components',
      global: true,
    }
  ],

  // Plugin configuration
  plugins: [
    '~/plugins/api.ts',
    '~/plugins/component-registration.ts',
    '~/plugins/manual-component-registration.ts'
  ],

  // Build configuration
  build: {
    transpile: ['vue-toastification', 'estree-walker']
  },

  // Development server configuration
  devServer: {
    port: 3000,
    host: 'localhost'
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true
  },

  // Vite configuration
  vite: {
    optimizeDeps: {
      include: ['estree-walker'],
      exclude: []
    },
    resolve: {
      dedupe: ['vue'],
      alias: {
        'estree-walker': './resolve-estree-walker.js'
      }
    },
    define: {
      // Enable detailed hydration mismatch warnings in development
      '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': 'true'
    },
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000
      }
    }
  },

  // Vue compiler options
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.includes('-') && !tag.startsWith('ui-')
    }
  },
  
  // Nitro configuration
  nitro: {
    compatibilityDate: '2025-06-14'
  }
})
