<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Design System</h1>
    
    <!-- Colors -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Colors</h2>
      
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-2">Primary</h3>
        <div class="flex flex-wrap gap-4">
          <div v-for="(value, key) in colors.primary" :key="`primary-${key}`" class="text-center">
            <div 
              class="w-20 h-20 rounded-md mb-2" 
              :style="`background-color: ${value}`"
            ></div>
            <div class="text-sm">{{ key }}</div>
            <div class="text-xs text-gray-500">{{ value }}</div>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-2">Secondary</h3>
        <div class="flex flex-wrap gap-4">
          <div v-for="(value, key) in colors.secondary" :key="`secondary-${key}`" class="text-center">
            <div 
              class="w-20 h-20 rounded-md mb-2" 
              :style="`background-color: ${value}`"
            ></div>
            <div class="text-sm">{{ key }}</div>
            <div class="text-xs text-gray-500">{{ value }}</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Typography -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Typography</h2>
      
      <div class="space-y-4">
        <div>
          <div class="text-sm text-gray-500 mb-1">4XL</div>
          <div class="text-4xl">The quick brown fox jumps over the lazy dog</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">3XL</div>
          <div class="text-3xl">The quick brown fox jumps over the lazy dog</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">2XL</div>
          <div class="text-2xl">The quick brown fox jumps over the lazy dog</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">XL</div>
          <div class="text-xl">The quick brown fox jumps over the lazy dog</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">LG</div>
          <div class="text-lg">The quick brown fox jumps over the lazy dog</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">Base</div>
          <div class="text-base">The quick brown fox jumps over the lazy dog</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">SM</div>
          <div class="text-sm">The quick brown fox jumps over the lazy dog</div>
        </div>
        <div>
          <div class="text-sm text-gray-500 mb-1">XS</div>
          <div class="text-xs">The quick brown fox jumps over the lazy dog</div>
        </div>
      </div>
    </section>
    
    <!-- Buttons -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Buttons</h2>
      
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium mb-2">Variants</h3>
          <div class="flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-medium mb-2">Sizes</h3>
          <div class="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-medium mb-2">States</h3>
          <div class="flex flex-wrap gap-4">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Cards -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Cards</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <template #header>
            <h3 class="text-lg font-medium">Card with Header and Footer</h3>
          </template>
          
          <p>This is the main content of the card. You can put any content here.</p>
          
          <template #footer>
            <div class="flex justify-end">
              <Button size="sm">Action</Button>
            </div>
          </template>
        </Card>
        
        <Card>
          <h3 class="text-lg font-medium mb-2">Simple Card</h3>
          <p>This is a simple card with just body content.</p>
        </Card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { colors, typography } from '~/assets/design-system';
import Button from '~/components/ui/Button.vue';
import Card from '~/components/ui/Card.vue';
</script>