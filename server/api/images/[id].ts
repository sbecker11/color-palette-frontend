import { defineEventHandler, getQuery, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  // Get the image ID from the route parameter
  const id = getRouterParam(event, 'id')
  
  // Get the runtime config
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:3001/api/v1'
  
  try {
    // Try to fetch from the real API
    const response = await fetch(`${apiBase}/images/${id}`)
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching image ${id} from API:`, error)
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log(`Returning mock data for image ${id}`)
      return getMockImageData(id)
    }
    
    // In production, throw the error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch image data',
    })
  }
})

// Helper function to generate mock image data
function getMockImageData(id: string) {
  return {
    id,
    name: `Sample Image ${id}`,
    url: `https://picsum.photos/id/${parseInt(id) % 100}/800/600`,
    thumbnail_url: `https://picsum.photos/id/${parseInt(id) % 100}/400/300`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    width: 800,
    height: 600,
    file_size: 123456,
    file_type: 'image/jpeg',
    colors: [
      { hex: '#FF5733', rgb: 'rgb(255, 87, 51)', name: 'Coral Red' },
      { hex: '#33FF57', rgb: 'rgb(51, 255, 87)', name: 'Lime Green' },
      { hex: '#3357FF', rgb: 'rgb(51, 87, 255)', name: 'Royal Blue' },
      { hex: '#F3FF33', rgb: 'rgb(243, 255, 51)', name: 'Bright Yellow' },
      { hex: '#33FFF3', rgb: 'rgb(51, 255, 243)', name: 'Aqua' }
    ]
  }
}