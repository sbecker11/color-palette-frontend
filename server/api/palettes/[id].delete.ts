import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  // Get the palette ID from the route parameter
  const id = getRouterParam(event, 'id')
  
  // Get the runtime config
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:3001/api/v1'
  
  try {
    // Try to delete via the real API
    const response = await fetch(`${apiBase}/palettes/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    
    // Return success response
    return { success: true, message: `Palette ${id} deleted successfully` }
  } catch (error) {
    console.error(`Error deleting palette ${id} via API:`, error)
    
    // In development, return mock success response
    if (process.env.NODE_ENV === 'development') {
      console.log(`Returning mock delete response for palette ${id}`)
      return { success: true, message: `Palette ${id} deleted successfully (mock)` }
    }
    
    // In production, throw the error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete palette',
    })
  }
})