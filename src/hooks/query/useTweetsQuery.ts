import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { fetchTweets, fetchInfiniteTweets, type FetchTweetsParams } from '@/lib/api/tweets'

// Query keys for consistent caching
export const tweetsKeys = {
  all: ['tweets'] as const,
  lists: () => [...tweetsKeys.all, 'list'] as const,
  list: (params: FetchTweetsParams) => [...tweetsKeys.lists(), params] as const,
  infinite: (limit: number) => [...tweetsKeys.all, 'infinite', limit] as const,
}

// Basic tweets query hook
export function useTweetsQuery(params: FetchTweetsParams = {}) {
  return useQuery({
    queryKey: tweetsKeys.list(params),
    queryFn: () => fetchTweets(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Infinite tweets query hook for pagination
export function useInfiniteTweetsQuery(limit = 15) {
  return useInfiniteQuery({
    queryKey: tweetsKeys.infinite(limit),
    queryFn: ({ pageParam }: { pageParam: string | null }) => fetchInfiniteTweets({ pageParam, limit }),
    initialPageParam: null, // Changed from 0 to null for cursor-based pagination
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Performance optimizations
    maxPages: 10, // Limit to 10 pages to prevent memory issues
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  })
}

// Enhanced convenience hook with better loading states
export function useTweets(limit: number, tag?: string) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["tweets", limit, tag],
    queryFn: ({ pageParam }) => fetchTweets({ limit, cursor: pageParam, tag }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  return {
    tweets,
    error: error?.message || null,
    isLoadingInitial: status === "pending" && !tweets.length,
    isLoadingMore: isFetchingNextPage,
    isEmpty: status === "success" && !tweets.length,
    isReachingEnd: !hasNextPage,
    refetch,
    fetchNextPage,
    hasMore: !!hasNextPage,
    isFetchingNextPage,
    isError: status === 'error',
    totalTweets: tweets.length
  };
} 