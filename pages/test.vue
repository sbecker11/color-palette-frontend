<template>
  <div class="container mx-auto p-8">
    <h1 class="text-2xl font-bold mb-6">Component Test Page</h1>
    
    <div class="space-y-4">
      <div>
        <h2 class="text-lg font-semibold mb-2">UiButton Component</h2>
        <div class="flex flex-wrap gap-4">
          <UiButton>Default Button</UiButton>
          <UiButton variant="primary">Primary Button</UiButton>
          <UiButton variant="secondary">Secondary Button</UiButton>
          <UiButton variant="danger">Danger Button</UiButton>
          <UiButton variant="link">Link Button</UiButton>
          <UiButton disabled>Disabled Button</UiButton>
        </div>
      </div>
      
      <div>
        <h2 class="text-lg font-semibold mb-2">Button Sizes</h2>
        <div class="flex flex-wrap gap-4 items-center">
          <UiButton size="sm">Small Button</UiButton>
          <UiButton size="md">Medium Button</UiButton>
          <UiButton size="lg">Large Button</UiButton>
        </div>
      </div>
      
      <div>
        <h2 class="text-lg font-semibold mb-2">Button with Link</h2>
        <UiButton to="/">Go to Home</UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional setup needed
</script>