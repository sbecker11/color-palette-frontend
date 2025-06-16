import { defineEventHandler, getQuery, readBody } from 'h3'

// GET handler for listing palettes
export default defineEventHandler(async (event) => {
  // Check if this is a GET or POST request
  if (event.method === 'POST') {
    return handleCreatePalette(event)
  }
  
  // Handle GET request (list palettes)
  const query = getQuery(event)
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:3001/api/v1'
  
  try {
    // Build query string
    const queryParams = new URLSearchParams()
    if (query.page) queryParams.append('page', query.page.toString())
    if (query.limit) queryParams.append('limit', query.limit.toString())
    if (query.search) queryParams.append('search', query.search.toString())
    
    // Try to fetch from the real API
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    const response = await fetch(`${apiBase}/palettes${queryString}`)
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching palettes from API:', error)
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock palettes data')
      return getMockPalettesData(query)
    }
    
    // In production, throw the error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch palettes data',
    })
  }
})

// POST handler for creating a palette
async function handleCreatePalette(event) {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:3001/api/v1'
  
  try {
    // Try to create via the real API
    const response = await fetch(`${apiBase}/palettes`, {
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
    console.error('Error creating palette via API:', error)
    
    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Returning mock create palette response')
      return getMockCreatePaletteResponse(body)
    }
    
    // In production, throw the error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create palette',
    })
  }
}

// Helper function to generate mock palettes data
function getMockPalettesData(query: any) {
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const total = 25 // Mock total count
  
  // Generate mock palettes
  const palettes = Array.from({ length: Math.min(limit, total - (page - 1) * limit) }, (_, i) => {
    const id = `palette-${(page - 1) * limit + i + 1}`
    const imageId = `image-${Math.floor(Math.random() * 20) + 1}`
    
    return {
      id,
      name: `Palette ${(page - 1) * limit + i + 1}`,
      description: i % 2 === 0 ? `A sample palette description for ${id}` : '',
      image_id: imageId,
      image_url: `/api/mock/images/${imageId}.jpg`,
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      updated_at: new Date(Date.now() - i * 43200000).toISOString(),
      colors: [
        { id: `color-${id}-1`, hex: '#FF5733', rgb: 'rgb(255, 87, 51)', name: 'Coral Red', position: 1 },
        { id: `color-${id}-2`, hex: '#33FF57', rgb: 'rgb(51, 255, 87)', name: 'Lime Green', position: 2 },
        { id: `color-${id}-3`, hex: '#3357FF', rgb: 'rgb(51, 87, 255)', name: 'Royal Blue', position: 3 }
      ]
    }
  })
  
  return {
    palettes,
    meta: {
      pagination: {
        total,
        per_page: limit,
        current_page: page,
        total_pages: Math.ceil(total / limit)
      }
    }
  }
}

// Helper function to generate mock create palette response
function getMockCreatePaletteResponse(body: any) {
  const id = `palette-${Date.now()}`
  const imageId = body.imageId || body.image_id || `image-${Math.floor(Math.random() * 20) + 1}`
  
  // Use provided colors or generate mock ones
  const colors = body.colors || [
    { id: `color-${id}-1`, hex: '#FF5733', rgb: 'rgb(255, 87, 51)', name: 'Coral Red', position: 1 },
    { id: `color-${id}-2`, hex: '#33FF57', rgb: 'rgb(51, 255, 87)', name: 'Lime Green', position: 2 },
    { id: `color-${id}-3`, hex: '#3357FF', rgb: 'rgb(51, 87, 255)', name: 'Royal Blue', position: 3 }
  ]
  
  return {
    id,
    name: body.name || `New Palette ${id}`,
    description: body.description || '',
    image_id: imageId,
    image_url: `/api/mock/images/${imageId}.jpg`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    colors: colors.map((color, index) => ({
      id: color.id || `color-${id}-${index + 1}`,
      hex: color.hex,
      rgb: color.rgb,
      name: color.name || '',
      position: color.position || index + 1
    }))
  }
}