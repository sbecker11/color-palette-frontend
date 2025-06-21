import { readFile } from 'fs/promises'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'
import { resolve } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const jsonlFilePath = config.public.imageMetadataJsonlFile
    
    if (!jsonlFilePath) {
      return {
        success: false,
        error: 'No JSONL file path configured'
      }
    }
    
    // Check if the file exists and is accessible
    try {
      await readFile(jsonlFilePath, { encoding: 'utf8' })
    } catch (error) {
      return {
        success: false,
        error: `Could not access JSONL file: ${error.message}`
      }
    }
    
    // Read the JSONL file line by line
    const fileStream = createReadStream(jsonlFilePath)
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })
    
    const data = []
    
    for await (const line of rl) {
      if (line.trim()) {
        try {
          const parsedLine = JSON.parse(line)
          data.push(parsedLine)
        } catch (error) {
          console.error('Error parsing JSONL line:', error)
          // Continue with next line
        }
      }
    }
    
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error in JSONL metadata endpoint:', error)
    return {
      success: false,
      error: `Failed to process JSONL file: ${error.message}`
    }
  }
})
