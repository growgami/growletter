import { useState, useEffect, useMemo, useRef, useCallback } from 'react'

export interface MasonryItem {
  id: string
  embedType?: 'twitter' | 'video' | 'iframe' | 'image'
  [key: string]: string | number | boolean | object | undefined;
}

interface UseMasonryLayoutOptions {
  items: MasonryItem[]
  breakpoints?: {
    sm: number  // mobile
    md: number  // tablet  
    lg: number  // desktop
  }
}

// Hook to get responsive column count
function useResponsiveColumns() {
  const [isMounted, setIsMounted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [columnCount, setColumnCount] = useState(1) // Always start with 1 for SSR safety

  useEffect(() => {
    // Mark as mounted and calculate initial column count
    setIsMounted(true)
    
    const updateColumnCount = () => {
      if (typeof window === 'undefined') return
      
      const width = window.innerWidth
      let newColumnCount: number
      
      // Simple responsive breakpoints
      if (width >= 1280) {
        newColumnCount = 4
      }
      else if (width >= 1024) {
        newColumnCount = 3
      } else if (width >= 768) { 
        newColumnCount = 2
      } else {
        newColumnCount = 1
      }
      
      console.log('📐 Column count update:', {
        width,
        newColumnCount,
        breakpoint: width >= 960 ? '960+' : '<960',
        isMounted
      })
      
      setColumnCount(newColumnCount)
      
      // Mark as ready after first calculation
      if (!isReady) {
        // Use requestAnimationFrame to ensure the DOM is ready
        requestAnimationFrame(() => {
          setIsReady(true)
        })
      }
    }

    // Set initial value with a slight delay to ensure DOM is ready
    const initialTimeout = setTimeout(updateColumnCount, 50)

    // Listen for resize events with debouncing
    let timeoutId: NodeJS.Timeout
    const debouncedUpdate = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateColumnCount, 150)
    }

    window.addEventListener('resize', debouncedUpdate)
    return () => {
      window.removeEventListener('resize', debouncedUpdate)
      clearTimeout(timeoutId)
      clearTimeout(initialTimeout)
    }
  }, [isReady])

  // Return SSR-safe column count
  return { 
    columnCount: isMounted ? columnCount : 1, 
    isMounted,
    isReady: isMounted && isReady
  }
}

// Main masonry layout hook with stable positioning
export function useMasonryLayout({ items }: UseMasonryLayoutOptions) {
  const { columnCount, isMounted, isReady } = useResponsiveColumns()
  const [isInitialized, setIsInitialized] = useState(false)
  const [layoutVersion, setLayoutVersion] = useState(0)
  
  // Keep track of previously processed items to maintain stability
  const previousItemsRef = useRef<MasonryItem[]>([])
  const previousColumnsRef = useRef<MasonryItem[][]>([])
  const previousColumnHeightsRef = useRef<number[]>([])
  const previousColumnCountRef = useRef<number>(columnCount)

  // Force re-layout function
  const forceReLayout = useCallback(() => {
    console.log('🔄 Forcing layout recalculation')
    setLayoutVersion(prev => prev + 1)
    setIsInitialized(false)
    // Clear refs to force full redistribution
    previousItemsRef.current = []
    previousColumnsRef.current = []
    previousColumnHeightsRef.current = []
  }, [])

  // Initialize only when we have items, component is mounted AND ready
  useEffect(() => {
    if (items.length > 0 && columnCount > 0 && isReady && !isInitialized) {
      console.log('🎯 Initializing masonry layout:', {
        itemsLength: items.length,
        columnCount,
        isMounted,
        isReady,
        layoutVersion
      })
      // Small delay to ensure everything is settled
      const initTimeout = setTimeout(() => {
        setIsInitialized(true)
      }, 100)
      
      return () => clearTimeout(initTimeout)
    }
  }, [items.length, columnCount, isReady, isInitialized, layoutVersion])

  // Reset initialization when items change significantly or column count changes
  useEffect(() => {
    const previousItems = previousItemsRef.current
    const previousColumnCount = previousColumnCountRef.current
    
    const isDifferentItemSet = previousItems.length > 0 && items.length > 0 && 
      !items.every((item, index) => previousItems[index]?.id === item.id)
    
    const columnCountChanged = previousColumnCount !== columnCount && previousColumnCount > 0
    
    if ((isDifferentItemSet || columnCountChanged) && isInitialized) {
      console.log('🔄 Resetting masonry due to:', {
        isDifferentItemSet,
        columnCountChanged,
        previousCount: previousColumnCount,
        newCount: columnCount
      })
      forceReLayout()
    }
  }, [items, columnCount, isInitialized, forceReLayout])

  // Stable distribution that preserves existing layout
  const columns = useMemo(() => {
    // Don't calculate until we're properly initialized
    if (!isInitialized || !isReady || !items.length || columnCount <= 0) {
      console.log('⏳ Masonry not ready:', {
        isInitialized,
        isReady,
        itemsLength: items.length,
        columnCount,
        layoutVersion
      })
      return []
    }

    const previousItems = previousItemsRef.current
    const previousColumns = previousColumnsRef.current
    const previousColumnHeights = previousColumnHeightsRef.current
    const previousColumnCount = previousColumnCountRef.current

    // Check conditions for redistribution
    const columnCountChanged = previousColumnCount !== columnCount
    const isFreshMount = previousItems.length === 0 && items.length > 0
    const isDifferentItemSet = previousItems.length > 0 && items.length > 0 && 
      !items.every((item, index) => previousItems[index]?.id === item.id)
    const newItems = items.slice(previousItems.length)
    
    console.log('🔄 Masonry calculation:', {
      totalItems: items.length,
      previousItems: previousItems.length,
      newItems: newItems.length,
      columnCount,
      columnCountChanged,
      isFreshMount,
      isDifferentItemSet,
      layoutVersion
    })

    let cols: MasonryItem[][]
    let columnHeights: number[]

    if (columnCountChanged || previousColumns.length === 0 || isFreshMount || isDifferentItemSet || layoutVersion > 0) {
      // Full redistribution
      console.log('🏗️ Full redistribution due to:', {
        columnCountChanged,
        firstRender: previousColumns.length === 0,
        isFreshMount,
        isDifferentItemSet,
        layoutVersionReset: layoutVersion > 0
      })
      
      cols = Array.from({ length: columnCount }, () => [])
      columnHeights = Array(columnCount).fill(0)

      // Redistribute all items with better height estimation
      items.forEach((item, index) => {
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
        cols[shortestColumnIndex].push(item)
        const estimatedHeight = estimateItemHeight(item, index)
        columnHeights[shortestColumnIndex] += estimatedHeight
      })
    } else {
      // Preserve existing layout and only append new items
      console.log('📌 Preserving existing layout, appending new items')
      
      cols = previousColumns.map(col => [...col]) // Deep copy
      columnHeights = [...previousColumnHeights] // Copy heights
      
      // Ensure we have the right number of columns
      while (cols.length < columnCount) {
        cols.push([])
        columnHeights.push(0)
      }
      while (cols.length > columnCount) {
        const removed = cols.pop()
        columnHeights.pop()
        // Redistribute removed items
        removed?.forEach(item => {
          const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
          cols[shortestColumnIndex].push(item)
          const estimatedHeight = estimateItemHeight(item, 0)
          columnHeights[shortestColumnIndex] += estimatedHeight
        })
      }

      // Only distribute new items
      newItems.forEach((item, index) => {
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
        cols[shortestColumnIndex].push(item)
        const estimatedHeight = estimateItemHeight(item, previousItems.length + index)
        columnHeights[shortestColumnIndex] += estimatedHeight
      })
    }

    // Update refs for next render
    previousItemsRef.current = [...items]
    previousColumnsRef.current = cols.map(col => [...col]) // Deep copy
    previousColumnHeightsRef.current = [...columnHeights]
    previousColumnCountRef.current = columnCount

    // Log distribution for debugging
    const distribution = cols.map(col => col.length)
    const heightDifference = columnHeights.length > 0 ? Math.max(...columnHeights) - Math.min(...columnHeights) : 0
    
    console.log('🏗️ Masonry distribution complete:', {
      totalItems: items.length,
      columnCount,
      distribution,
      columnHeights: columnHeights.map(h => Math.round(h)),
      heightDifference: Math.round(heightDifference),
      isBalanced: heightDifference < 100,
      newItemsAdded: newItems.length
    })

    return cols
  }, [items, columnCount, isInitialized, isReady, layoutVersion])

  // Provide a callback to manually trigger redistribution (useful for Twitter embeds)
  const redistributeLayout = useCallback(() => {
    if (isInitialized && isReady) {
      console.log('🔧 Manual layout redistribution triggered')
      forceReLayout()
    }
  }, [isInitialized, isReady, forceReLayout])

  return {
    columns,
    columnCount,
    totalItems: items.length,
    isInitialized: isInitialized && isReady,
    isMounted,
    isReady,
    isBalanced: columns.length > 0 && 
      Math.max(...columns.map(col => col.length)) - Math.min(...columns.map(col => col.length)) <= 1,
    redistributeLayout,
    forceReLayout
  }
}

// Enhanced helper function to estimate item height for better distribution
function estimateItemHeight(item: MasonryItem, index: number): number {
  // Base height for tweet card
  let height = 180

  // Adjust based on content type
  switch (item.embedType) {
    case 'video':
      height += 220 // Videos are typically taller (16:9 aspect ratio)
      break
    case 'image':
      height += 160 // Images add moderate height
      break
    case 'twitter':
      height += 120 // Twitter embeds vary but generally medium height
      break
    case 'iframe':
      height += 200 // iframes can be quite tall
      break
    default:
      height += 100 // Default for unknown types
  }

  // Add some variation based on position to prevent perfect uniformity
  // This helps create a more natural masonry look
  const variation = (index % 3) * 20 + Math.random() * 30
  height += variation

  // Ensure minimum height
  return Math.max(height, 150)
} 