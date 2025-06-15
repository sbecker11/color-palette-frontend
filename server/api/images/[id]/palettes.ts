import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  // Get the image ID from the route parameter
  const imageId = getRouterParam(event, 'id')
  
  // Get the runtime config
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:3001/api/v1'
  
  try {
    // Try to fetch from the real API
    const response = await fetch(`${apiBase}/images/${imageId}/palettes`)
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching palettes for image ${imageId} from API:`, error)
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log(`Returning mock palette data for image ${imageId}`)
      return getMockPalettesData(imageId)
    }
    
    // In production, throw the error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch palette data',
    })
  }
})

// Helper function to generate mock palettes data
function getMockPalettesData(imageId: string) {
  // Generate 0-3 palettes for this image
  const count = Math.floor(Math.random() * 4)
  
  return Array.from({ length: count }, (_, i) => {
    return {
      id: `palette-${imageId}-${i + 1}`,
      name: `Palette ${i + 1} for Image ${imageId}`,
      description: i % 2 === 0 ? `A sample palette description for image ${imageId}` : '',
      image_id: imageId,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      updated_at: new Date(Date.now() - i * 86400000).toISOString(),
      colors: [
        { id: `color-${imageId}-${i}-1`, hex: '#FF5733', rgb: 'rgb(255, 87, 51)', name: 'Coral Red' },
        { id: `color-${imageId}-${i}-2`, hex: '#33FF57', rgb: 'rgb(51, 255, 87)', name: 'Lime Green' },
        { id: `color-${imageId}-${i}-3`, hex: '#3357FF', rgb: 'rgb(51, 87, 255)', name: 'Royal Blue' },
        { id: `color-${imageId}-${i}-4`, hex: '#F3FF33', rgb: 'rgb(243, 255, 51)', name: 'Bright Yellow' },
        { id: `color-${imageId}-${i}-5`, hex: '#33FFF3', rgb: 'rgb(51, 255, 243)', name: 'Aqua' }
      ]
    }
  })
}