import { useState, useEffect, useMemo, useRef } from 'react'

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
  const [columnCount, setColumnCount] = useState(() => {
    // Default to 1 column for SSR (mobile-first approach)
    return 1
  })

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
        breakpoint: width >= 960 ? '960+' : '<960'
      })
      
      setColumnCount(newColumnCount)
    }

    // Set initial value immediately after mount
    const rafId = requestAnimationFrame(updateColumnCount)

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
      cancelAnimationFrame(rafId)
    }
  }, [])

  // Return SSR-safe column count
  return isMounted ? columnCount : 1
}

// Main masonry layout hook with stable positioning
export function useMasonryLayout({ items }: UseMasonryLayoutOptions) {
  const columnCount = useResponsiveColumns()
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Keep track of previously processed items to maintain stability
  const previousItemsRef = useRef<MasonryItem[]>([])
  const previousColumnsRef = useRef<MasonryItem[][]>([])
  const previousColumnHeightsRef = useRef<number[]>([])
  const previousColumnCountRef = useRef<number>(columnCount)

  // Initialize immediately when we have items and the responsive column count is ready
  useEffect(() => {
    if (items.length > 0 && columnCount > 0 && !isInitialized) {
      setIsInitialized(true)
    }
  }, [items.length, columnCount, isInitialized])

  // Stable distribution that preserves existing layout
  const columns = useMemo(() => {
    if (!items.length || columnCount <= 0) return []

    const previousItems = previousItemsRef.current
    const previousColumns = previousColumnsRef.current
    const previousColumnHeights = previousColumnHeightsRef.current
    const previousColumnCount = previousColumnCountRef.current

    // Check if column count changed (responsive breakpoint change)
    const columnCountChanged = previousColumnCount !== columnCount
    
    // Check if this is a fresh mount (page refresh)
    const isFreshMount = previousItems.length === 0 && items.length > 0
    
    // Check if this is a completely different set of items (e.g., filter change)
    const isDifferentItemSet = previousItems.length > 0 && items.length > 0 && 
      !items.every((item, index) => previousItems[index]?.id === item.id)
    
    // Find new items that weren't in the previous render
    const newItems = items.slice(previousItems.length)
    
    console.log('🔄 Masonry update:', {
      totalItems: items.length,
      previousItems: previousItems.length,
      newItems: newItems.length,
      columnCount,
      columnCountChanged,
      isFreshMount,
      isDifferentItemSet,
      isInitialized
    })

    let cols: MasonryItem[][]
    let columnHeights: number[]

    if (columnCountChanged || previousColumns.length === 0 || isFreshMount || isDifferentItemSet) {
      // If column count changed, first render, fresh mount, or different item set, redistribute all items
      console.log('🏗️ Full redistribution due to:', {
        columnCountChanged,
        firstRender: previousColumns.length === 0,
        isFreshMount,
        isDifferentItemSet
      })
      
      cols = Array.from({ length: columnCount }, () => [])
      columnHeights = Array(columnCount).fill(0)

      // Redistribute all items
      items.forEach((item, index) => {
        const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
        cols[shortestColumnIndex].push(item)
        const estimatedHeight = estimateItemHeight(item, index)
        columnHeights[shortestColumnIndex] += estimatedHeight
      })
    } else {
      // Preserve existing layout and only append new items
      console.log('📌 Preserving existing layout, appending new items')
      
      // Start with previous columns and heights
      cols = previousColumns.map(col => [...col]) // Deep copy
      columnHeights = [...previousColumnHeights] // Copy heights
      
      // Ensure we have the right number of columns
      while (cols.length < columnCount) {
        cols.push([])
        columnHeights.push(0)
      }
      while (cols.length > columnCount) {
        cols.pop()
        columnHeights.pop()
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
    
    console.log('🏗️ Masonry distribution:', {
      totalItems: items.length,
      columnCount,
      distribution,
      columnHeights: columnHeights.map(h => Math.round(h)),
      heightDifference: Math.round(heightDifference),
      isBalanced: heightDifference < 100,
      newItemsAdded: newItems.length
    })

    return cols
  }, [items, columnCount, isInitialized])

  return {
    columns,
    columnCount,
    totalItems: items.length,
    isInitialized,
    isBalanced: columns.length > 0 && 
      Math.max(...columns.map(col => col.length)) - Math.min(...columns.map(col => col.length)) <= 1
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