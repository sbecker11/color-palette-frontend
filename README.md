# Color Palette Tool - Frontend

Vue 3 + Nuxt 3 frontend for the Color Palette Tool application, allowing users to create and manage color palettes from images.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Requirements](#setup-requirements)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Running the Frontend](#running-the-frontend)
  - [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
  - [Component Development](#component-development)
  - [State Management](#state-management)
  - [API Integration](#api-integration)
  - [Testing](#testing)
- [Deployment](#deployment)
  - [Build for Production](#build-for-production)
  - [Static Site Generation](#static-site-generation)
  - [Docker Deployment](#docker-deployment)
- [Troubleshooting](#troubleshooting)
- [Backend Repository](#backend-repository)

## Features <a id="features"></a>

- Upload images via URL or local filesystem
- Browse local image collection
- Create named color palettes from images
- Manual color selection by clicking on images
- Automatic K-means clustering color extraction
- Color editing via RGB/HSV input or native color picker
- Image pixel sampling for color extraction
- Swatch reordering and deletion
- Export palettes as JSON (compatible with flock-of-postcards format)
- Responsive design for desktop and mobile

## Tech Stack <a id="tech-stack"></a>

- **Framework**: Vue 3 + Nuxt 3
- **Language**: TypeScript
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API / Axios
- **Testing**: Vitest + Vue Test Utils
- **Design**: Figma
- **Build Tool**: Vite (via Nuxt)

## Setup Requirements <a id="setup-requirements"></a>

* Node.js version
  - Node.js 16+ (LTS recommended)
  - npm or yarn

* System dependencies
  - Backend API running (see Backend Repository section)

* Configuration
  - Set up environment variables in `.env` file

## Getting Started <a id="getting-started"></a>

### Installation <a id="installation"></a>

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd color-palette-frontend

# Install dependencies
npm install
# or
yarn install
```

### Running the Frontend <a id="running-the-frontend"></a>

```bash
# Start the development server
npm run dev
# or
yarn dev
```

The frontend will be available at http://localhost:3000.

### Environment Configuration <a id="environment-configuration"></a>

Create a `.env` file in the root directory with the following variables:

```
API_BASE_URL=http://localhost:3001/api/v1
```

This configures the frontend to connect to the backend API.

## Project Structure <a id="project-structure"></a>

```
color-palette-frontend/
├── assets/                  # Static assets and CSS
├── components/              # Vue components
├── layouts/                 # Nuxt layouts
├── pages/                   # Nuxt pages
├── plugins/                 # Nuxt plugins
├── public/                  # Public static files
├── stores/                  # Pinia stores
├── types/                   # TypeScript type definitions
├── composables/             # Vue composables
├── utils/                   # Utility functions
├── middleware/              # Nuxt middleware
├── server/                  # Server-side code (if any)
├── nuxt.config.ts           # Nuxt configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies and scripts
```

## Development Workflow <a id="development-workflow"></a>

### Component Development <a id="component-development"></a>

Components are stored in the `components/` directory and are auto-imported by Nuxt.

```bash
# Create a new component
touch components/ColorPicker.vue
```

Example component structure:

```vue
<template>
  <div class="color-picker">
    <!-- Component template -->
  </div>
</template>

<script setup lang="ts">
// Component logic using Vue 3 Composition API
const props = defineProps<{
  initialColor: string
}>()

const emit = defineEmits<{
  (e: 'update:color', color: string): void
}>()

// Component logic
</script>

<style scoped>
/* Component styles (if not using Tailwind) */
</style>
```

### State Management <a id="state-management"></a>

This project uses Pinia for state management. Stores are located in the `stores/` directory.

Example store:

```typescript
// stores/palette.ts
import { defineStore } from 'pinia'

interface Color {
  id: string
  hex: string
  rgb: [number, number, number]
  hsv: [number, number, number]
  position: number
}

interface Palette {
  id: string
  name: string
  imageId: string
  colors: Color[]
}

export const usePaletteStore = defineStore('palette', {
  state: () => ({
    palettes: [] as Palette[],
    currentPalette: null as Palette | null,
    loading: false,
    error: null as string | null
  }),
  
  actions: {
    async fetchPalettes() {
      // Implementation
    },
    
    async createPalette(palette: Omit<Palette, 'id'>) {
      // Implementation
    }
    
    // Other actions
  }
})
```

Usage in components:

```typescript
import { usePaletteStore } from '~/stores/palette'

const paletteStore = usePaletteStore()
await paletteStore.fetchPalettes()
```

### API Integration <a id="api-integration"></a>

API calls are made using the Fetch API or Axios. The base URL is configured in `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ...
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001/api/v1'
    }
  }
  // ...
})
```

Example API call in a component or store:

```typescript
const config = useRuntimeConfig()
const { data, error } = await useFetch(`${config.public.apiBase}/images`)
```

### Testing <a id="testing"></a>

This project uses Vitest for testing Vue components and stores.

```bash
# Run all tests
npm test
# or
yarn test

# Run tests with UI
npm run test:ui
# or
yarn test:ui

# Run tests with coverage
npm run test:coverage
# or
yarn test:coverage
```

Example component test:

```typescript
// components/__tests__/ColorPicker.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ColorPicker from '../ColorPicker.vue'

describe('ColorPicker', () => {
  it('renders correctly with initial color', () => {
    const wrapper = mount(ColorPicker, {
      props: {
        initialColor: '#FF5733'
      }
    })
    
    expect(wrapper.find('.color-picker').exists()).toBe(true)
    // More assertions
  })
  
  // More tests
})
```

## Deployment <a id="deployment"></a>

### Build for Production <a id="build-for-production"></a>

```bash
# Build the application
npm run build
# or
yarn build
```

This creates a `.output` directory with the production build.

### Static Site Generation <a id="static-site-generation"></a>

```bash
# Generate static site
npm run generate
# or
yarn generate
```

This creates a `dist` directory with static HTML files.

### Docker Deployment <a id="docker-deployment"></a>

```bash
# Build Docker image
docker build -t color-palette-frontend .

# Run Docker container
docker run -p 3000:3000 color-palette-frontend
```

## Troubleshooting <a id="troubleshooting"></a>

1. **Clear Nuxt cache**:
   ```bash
   npx nuxi cleanup
   ```

2. **Verify Node.js version**:
   ```bash
   node -v
   ```
   Should be v16.0.0 or higher.

3. **Check npm/yarn version**:
   ```bash
   npm -v
   # or
   yarn -v
   ```

4. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules
   npm install
   # or
   yarn install
   ```

5. **Check API connectivity**:
   Ensure the backend API is running at the URL specified in your `.env` file.

## Backend Repository <a id="backend-repository"></a>

The backend API code is available at:
`/Users/sbecker11/color-palette-app/color-palette-api`

Make sure the API is running before starting the frontend development server.