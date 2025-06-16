import { defineEventHandler, getRouterParam, setResponseHeader } from 'h3'

export default defineEventHandler(async (event) => {
  // Get the image ID from the route parameter
  const id = getRouterParam(event, 'id')
  
  // Get the runtime config
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:3001/api/v1'
  
  try {
    // Try to fetch from the real API
    const response = await fetch(`${apiBase}/images/${id}/file`)
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    
    // Get the image data as a buffer
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // Set the content type header
    setResponseHeader(event, 'Content-Type', contentType)
    
    // Return the image data
    return Buffer.from(imageBuffer)
  } catch (error) {
    console.error(`Error fetching image ${id} from API:`, error)
    
    // In development, return a placeholder image
    if (process.env.NODE_ENV === 'development') {
      console.log(`Returning placeholder image for ${id}`)
      
      // Redirect to a placeholder image service
      const placeholderUrl = `https://picsum.photos/id/${parseInt(id) % 100}/800/600`
      
      try {
        // Fetch the placeholder image
        const placeholderResponse = await fetch(placeholderUrl)
        const placeholderBuffer = await placeholderResponse.arrayBuffer()
        
        // Set the content type header
        setResponseHeader(event, 'Content-Type', 'image/jpeg')
        
        // Return the placeholder image data
        return Buffer.from(placeholderBuffer)
      } catch (placeholderError) {
        console.error('Error fetching placeholder image:', placeholderError)
        throw createError({
          statusCode: 404,
          statusMessage: 'Image not found',
        })
      }
    }
    
    // In production, throw the error
    throw createError({
      statusCode: 404,
      statusMessage: 'Image not found',
    })
  }
})