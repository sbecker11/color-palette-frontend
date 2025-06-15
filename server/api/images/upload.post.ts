import { defineEventHandler, readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Get the runtime config
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase || 'http://localhost:3001/api/v1'
    
    // Read multipart form data
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw new Error('No form data received')
    }
    
    // Create a new FormData object to forward to the API
    const forwardFormData = new FormData()
    
    // Add each field to the new FormData
    formData.forEach(part => {
      forwardFormData.append(part.name, part.type === 'file' ? new Blob([part.data], { type: part.type }) : new TextDecoder().decode(part.data))
    })
    
    // Forward the request to the real API
    const response = await fetch(`${apiBase}/images`, {
      method: 'POST',
      body: forwardFormData
    })
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error uploading image:', error)
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock upload response')
      return {
        id: `image-${Date.now()}`,
        name: 'Uploaded Image',
        url: 'https://picsum.photos/800/600',
        thumbnail_url: 'https://picsum.photos/400/300',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    
    // In production, throw the error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload image',
    })
  }
})