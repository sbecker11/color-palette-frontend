import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Get the runtime config
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase || 'http://localhost:3001/api/v1'
    
    // Read request body
    const body = await readBody(event)
    
    if (!body.name || !body.url) {
      throw new Error('Name and URL are required')
    }
    
    // Forward the request to the real API
    const response = await fetch(`${apiBase}/images/from-url`, {
      method: 'POST',
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
    console.error('Error uploading image from URL:', error)
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      // Store body in a local variable to avoid scope issues
      const requestBody = await readBody(event).catch(() => ({}))
      
      console.log('Returning mock upload response')
      return {
        id: `image-${Date.now()}`,
        name: requestBody?.name || 'URL Image',
        url: requestBody?.url || 'https://picsum.photos/800/600',
        thumbnail_url: 'https://picsum.photos/400/300',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    
    // In production, throw the error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload image from URL',
    })
  }
})
