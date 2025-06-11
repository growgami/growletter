import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  rootMargin?: string
  threshold?: number
}

export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rootMargin = '200px',
  threshold = 0.1
}: UseInfiniteScrollOptions) {
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      
      // Only fetch if:
      // 1. Element is intersecting (visible)
      // 2. We have more pages to load
      // 3. We're not already fetching
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        console.log('🔄 Infinite scroll triggered - loading more content')
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  useEffect(() => {
    const trigger = triggerRef.current
    if (!trigger) return

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold
    })

    observer.observe(trigger)

    return () => {
      observer.unobserve(trigger)
      observer.disconnect()
    }
  }, [handleIntersection, rootMargin, threshold])

  return { triggerRef }
} 