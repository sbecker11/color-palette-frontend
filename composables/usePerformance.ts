import { ref, onMounted } from 'vue'

export const usePerformance = () => {
  const metrics = ref({
    pageLoadTime: 0,
    memoryUsage: 0,
    imageCount: 0,
    lastUpdate: null as Date | null
  })

  const startTime = ref(performance.now())

  // Debounce expensive operations
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Throttle high-frequency operations
  const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean
    return function executedFunction(...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // Track performance metrics
  const updateMetrics = () => {
    if (typeof window !== 'undefined') {
      metrics.value.pageLoadTime = performance.now() - startTime.value
      
      // Check memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory
        metrics.value.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
      }

      metrics.value.lastUpdate = new Date()
    }
  }

  // Optimized localStorage operations
  const batchLocalStorageOperation = (operations: Array<() => void>) => {
    // Batch multiple localStorage operations
    operations.forEach(op => op())
  }

  // Memory cleanup utility
  const cleanup = () => {
    // Clear any large objects from memory
    if (typeof window !== 'undefined') {
      // Force garbage collection if available (dev tools)
      if ('gc' in window) {
        (window as any).gc()
      }
    }
  }

  // Virtual scrolling helper for large lists
  const getVisibleItems = (allItems: any[], containerHeight: number, itemHeight: number, scrollTop: number) => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + 1, allItems.length)
    
    return {
      startIndex,
      endIndex,
      visibleItems: allItems.slice(startIndex, endIndex),
      totalHeight: allItems.length * itemHeight,
      offsetY: startIndex * itemHeight
    }
  }

  onMounted(() => {
    updateMetrics()
    
    // Update metrics periodically
    const interval = setInterval(updateMetrics, 5000) // Every 5 seconds
    
    // Cleanup on unmount
    return () => {
      clearInterval(interval)
      cleanup()
    }
  })

  return {
    metrics,
    updateMetrics,
    debounce,
    throttle,
    batchLocalStorageOperation,
    cleanup,
    getVisibleItems
  }
} 