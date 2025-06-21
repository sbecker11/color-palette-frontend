import { defineEventHandler } from 'h3'
import fs from 'fs'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const jsonlFilePath = config.public.imageMetadataJsonlFile

  if (!jsonlFilePath) {
    return {
      success: false,
      error: 'IMAGE_METADATA_JSONL_FILE environment variable is not set'
    }
  }

  try {
    // Check if file exists
    if (!fs.existsSync(jsonlFilePath)) {
      return {
        success: false,
        error: `JSONL file not found at path: ${jsonlFilePath}`
      }
    }

    // Read the file
    const fileContent = await readFile(jsonlFilePath, 'utf8')
    
    // Parse JSONL: one JSON object per line
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0)
    const jsonlData = lines.map(line => {
      try {
        return JSON.parse(line)
      } catch (err) {
        console.error('Error parsing JSONL line:', line)
        return null
      }
    }).filter(item => item !== null)

    return {
      success: true,
      data: jsonlData,
      filePath: jsonlFilePath
    }
  } catch (error) {
    console.error('Error reading JSONL file:', error)
    return {
      success: false,
      error: `Error reading JSONL file: ${error.message}`
    }
  }
})