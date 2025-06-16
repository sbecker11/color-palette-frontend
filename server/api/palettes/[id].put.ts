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
function getMockUpdatePaletteResponse(id: string, body: any) {
  console.log('Server: Creating mock update response for palette:', id)
  console.log('Server: Update body:', body)
  
  // Make sure to preserve all fields from the request body
  return {
    id,
    ...body,
    updatedAt: new Date().toISOString()
  }
}
