import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  // Get query parameters for pagination
  const query = getQuery(event)
  const page = query.page || 1
  const limit = query.limit || 12
  
  // Get the runtime config
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:3001/api/v1'
  
  try {
    // Try to fetch from the real API
    const response = await fetch(`${apiBase}/images?page=${page}&limit=${limit}`)
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching images from API:`, error)
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log(`Returning mock image data`)
      return getMockImagesData(Number(page), Number(limit))
    }
    
    // In production, throw the error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch images data',
    })
  }
})

// Helper function to generate mock images data
function getMockImagesData(page: number, limit: number) {
  const total = 50 // Mock total count
  
  const images = Array.from({ length: Math.min(limit, total - (page - 1) * limit) }, (_, i) => {
    const id = `${(page - 1) * limit + i + 1}`
    return {
      id,
      name: `Sample Image ${id}`,
      url: `https://picsum.photos/id/${parseInt(id) % 100}/800/600`,
      thumbnail_url: `https://picsum.photos/id/${parseInt(id) % 100}/400/300`,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      updated_at: new Date(Date.now() - i * 86400000).toISOString(),
      width: 800,
      height: 600,
      file_size: 123456,
      file_type: 'image/jpeg'
    }
  })
  
  return {
    images,
    total,
    page,
    limit
  }
}