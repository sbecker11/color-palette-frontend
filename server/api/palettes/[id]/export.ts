import { defineEventHandler, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  // Get the palette ID from the route parameter
  const id = getRouterParam(event, 'id')
  
  // Get the runtime config
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:3001/api/v1'
  
  try {
    // Try to fetch the export data from the real API
    const response = await fetch(`${apiBase}/palettes/${id}/export`)
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error exporting palette ${id} from API:`, error)
    
    // In development, return mock export data
    if (process.env.NODE_ENV === 'development') {
      console.log(`Returning mock export data for palette ${id}`)
      return getMockExportData(id)
    }
    
    // In production, throw the error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to export palette data',
    })
  }
})

// Helper function to generate mock export data
function getMockExportData(id: string) {
  return [
    {
      "id": "44e60575-adc2-4c94-ad96-f792a21c0fb8",
      "hex": "#302376",
      "hsv": [249, 70, 46],
      "rgb": [48, 35, 118],
      "position": 0
    },
    {
      "id": "d60adb66-d1d6-4d86-a91d-bcca8394ecca",
      "hex": "#015277",
      "hsv": [199, 99, 47],
      "rgb": [1, 82, 119],
      "position": 1
    },
    {
      "id": "618c52e4-4903-43c1-8e4f-668cc25dcc07",
      "hex": "#636fab",
      "hsv": [230, 42, 67],
      "rgb": [99, 111, 171],
      "position": 2
    },
    {
      "id": "8bb05bb3-379c-46fd-945c-f7df07bdc8bc",
      "hex": "#15aec2",
      "hsv": [187, 89, 76],
      "rgb": [21, 174, 194],
      "position": 3
    },
    {
      "id": "ff0054d5-1980-42ca-8827-d3b53dfb1c58",
      "hex": "#8eaccd",
      "hsv": [211, 31, 80],
      "rgb": [142, 172, 205],
      "position": 4
    }
  ]
}