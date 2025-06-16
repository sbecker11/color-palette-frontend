import { defineEventHandler, getRouterParam, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  // Get the palette ID from the route parameter
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  // Get the runtime config
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:3001/api/v1'
  
  try {
    // Try to update via the real API
    const response = await fetch(`${apiBase}/palettes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error updating palette ${id} via API:`, error)
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log(`Returning mock update response for palette ${id}`)
      return getMockUpdatePaletteResponse(id, body)
    }
    
    // In production, throw the error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update palette',
    })
  }
})

// Helper function to generate mock update palette response
function getMockUpdatePaletteResponse(id: string, updates: any) {
  // Extract image ID from palette ID if it follows a pattern like "palette-{imageId}-{number}"
  const parts = id.split('-')
  const imageId = updates.imageId || updates.image_id || (parts.length >= 3 ? `${parts[1]}` : 'default-image')
  
  return {
    id,
    name: updates.name || `Updated Palette ${id}`,
    description: updates.description !== undefined ? updates.description : `A sample palette with ID ${id}`,
    image_id: imageId,
    image_url: `/api/mock/images/${imageId}.jpg`,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    colors: updates.colors || [
      { id: `color-${id}-1`, hex: '#FF5733', rgb: 'rgb(255, 87, 51)', name: 'Coral Red', position: 1 },
      { id: `color-${id}-2`, hex: '#33FF57', rgb: 'rgb(51, 255, 87)', name: 'Lime Green', position: 2 },
      { id: `color-${id}-3`, hex: '#3357FF', rgb: 'rgb(51, 87, 255)', name: 'Royal Blue', position: 3 },
      { id: `color-${id}-4`, hex: '#F3FF33', rgb: 'rgb(243, 255, 51)', name: 'Bright Yellow', position: 4 }
    ]
  }
}