import { defineEventHandler, getRouterParam, setResponseHeader } from 'h3'

export default defineEventHandler(async (event) => {
  // Get the image ID from the route parameter
  const id = getRouterParam(event, 'id')
  
  console.log(`[IMAGE ENDPOINT] Serving image for ID: ${id}`)
  
  try {
    // Generate a deterministic seed from the ID
    const seed = parseInt(id.replace(/\D/g, '') || '1')
    
    // Generate deterministic colors based on the seed
    function seededRandom(seed: number) {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    
    function generateColor(seed: number, offset: number) {
      const hue = Math.floor(seededRandom(seed + offset) * 360)
      const saturation = 60 + Math.floor(seededRandom(seed + offset + 1) * 40) // 60-100%
      const lightness = 40 + Math.floor(seededRandom(seed + offset + 2) * 40)  // 40-80%
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }
    
    // Create a colorful geometric pattern
    const colors = []
    for (let i = 0; i < 12; i++) {
      colors.push(generateColor(seed, i * 7))
    }
    
    const colorfulSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]}" />
            <stop offset="50%" style="stop-color:${colors[1]}" />
            <stop offset="100%" style="stop-color:${colors[2]}" />
          </linearGradient>
          <radialGradient id="circle1" cx="30%" cy="30%" r="40%">
            <stop offset="0%" style="stop-color:${colors[3]}" />
            <stop offset="100%" style="stop-color:${colors[4]}" />
          </radialGradient>
          <radialGradient id="circle2" cx="70%" cy="70%" r="35%">
            <stop offset="0%" style="stop-color:${colors[5]}" />
            <stop offset="100%" style="stop-color:${colors[6]}" />
          </radialGradient>
        </defs>
        
        <!-- Background gradient -->
        <rect fill="url(#bg1)" width="800" height="600"/>
        
        <!-- Colorful geometric shapes -->
        <circle cx="240" cy="180" r="120" fill="url(#circle1)" opacity="0.8"/>
        <circle cx="560" cy="420" r="100" fill="url(#circle2)" opacity="0.8"/>
        
        <!-- Triangular shapes -->
        <polygon points="100,500 300,400 200,200" fill="${colors[7]}" opacity="0.7"/>
        <polygon points="500,100 700,200 600,350" fill="${colors[8]}" opacity="0.6"/>
        
        <!-- Rectangles -->
        <rect x="50" y="50" width="150" height="100" fill="${colors[9]}" opacity="0.7" transform="rotate(15 125 100)"/>
        <rect x="600" y="450" width="120" height="80" fill="${colors[10]}" opacity="0.8" transform="rotate(-20 660 490)"/>
        
        <!-- Additional circles for more color variety -->
        <circle cx="150" cy="350" r="60" fill="${colors[11]}" opacity="0.6"/>
        <circle cx="650" cy="150" r="80" fill="${colors[0]}" opacity="0.5"/>
        
        <!-- Overlay pattern for texture -->
        <rect x="0" y="0" width="800" height="600" fill="url(#bg1)" opacity="0.1"/>
        
        <!-- Small text indicator -->
        <text fill="rgba(255,255,255,0.3)" font-family="Arial, sans-serif" font-size="12" x="10" y="590">
          ${id}
        </text>
      </svg>
    `.trim()
    
    console.log(`[IMAGE ENDPOINT] Generated colorful SVG for ${id}`)
    
    setResponseHeader(event, 'Content-Type', 'image/svg+xml')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
    return colorfulSvg
    
  } catch (error) {
    console.error(`[IMAGE ENDPOINT] Error serving image ${id}:`, error)
    
    // Return a simple error SVG
    const errorSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect fill="#fef2f2" width="800" height="600"/>
        <circle cx="400" cy="280" r="30" fill="#fca5a5"/>
        <text fill="#dc2626" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" x="400" y="290">!</text>
        <text fill="#dc2626" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" x="400" y="340">
          Error loading image
        </text>
        <text fill="#991b1b" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" x="400" y="360">
          ${id}
        </text>
      </svg>
    `.trim()
    
    setResponseHeader(event, 'Content-Type', 'image/svg+xml')
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*')
    return errorSvg
  }
})