// Import dotenv to explicitly load environment variables
import { config } from 'dotenv'

// Load .env file
config()

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
      // Only set apiBase if API_BASE_URL is explicitly defined in .env
      apiBase: process.env.API_BASE_URL || null,
      imageMetadataJsonlFile: process.env.IMAGE_METADATA_JSONL_FILE || ''
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

  // TypeScript configuration - OPTIMIZED FOR PERFORMANCE
  typescript: {
    strict: false,  // Disable strict mode for better performance
    typeCheck: false,  // Disable type checking for faster dev builds
    shim: false
  },

  // Vite configuration - PERFORMANCE OPTIMIZATIONS
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
      // Disable hydration mismatch warnings for performance
      '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': 'false'
    },
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000
      }
    },
    // Add performance optimizations
    esbuild: {
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
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
    compatibilityDate: '2025-06-14',
    // Add these for better API handling
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        }
      }
    }
  },

  // App configuration
  app: {
    head: {
      title: 'Color Palette App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { key: 'description', name: 'description', content: 'Extract and manage color palettes from images' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
