import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { fetchTweets, fetchInfiniteTweets, type FetchTweetsParams } from '@/lib/api/tweets'

// Query keys for consistent caching
export const tweetsKeys = {
  all: ['tweets'] as const,
  lists: () => [...tweetsKeys.all, 'list'] as const,
  list: (params: FetchTweetsParams) => [...tweetsKeys.lists(), params] as const,
  infinite: (limit: number, clientId?: string | null) => [...tweetsKeys.all, 'infinite', limit, clientId] as const,
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
export function useInfiniteTweetsQuery(limit = 15, clientId?: string | null) {
  return useInfiniteQuery({
    queryKey: tweetsKeys.infinite(limit, clientId),
    queryFn: ({ pageParam }: { pageParam: string | null }) => fetchInfiniteTweets({ pageParam, limit, clientId }),
    initialPageParam: null, // Changed from 0 to null for cursor-based pagination
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Performance optimizations
    maxPages: 10, // Limit to 10 pages to prevent memory issues
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  })
}

// Progressive loading hook - loads 1 tweet first, then the rest
export function useProgressiveTweets(tag?: string, clientId?: string | null, search?: string) {
  const [isSecondPhaseLoaded, setIsSecondPhaseLoaded] = useState(false);
  
  // First phase: Load only 1 tweet for fast initial render
  const firstPhaseQuery = useInfiniteQuery({
    queryKey: ["tweets", "progressive", "first", 1, tag, clientId, search],
    queryFn: ({ pageParam }) => fetchTweets({ limit: 1, cursor: pageParam, tag, clientId, search }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: true,
  });

  // Second phase: Load remaining tweets (starting from limit 12 for normal pagination)
  const secondPhaseQuery = useInfiniteQuery({
    queryKey: ["tweets", "progressive", "second", 12, tag, clientId, search],
    queryFn: ({ pageParam }) => fetchTweets({ limit: 12, cursor: pageParam, tag, clientId, search }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isSecondPhaseLoaded,
  });

  // Trigger second phase after first tweet loads
  useEffect(() => {
    if (firstPhaseQuery.data?.pages?.[0]?.tweets?.length && !isSecondPhaseLoaded) {
      // Small delay to allow first tweet to render
      const timer = setTimeout(() => {
        setIsSecondPhaseLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [firstPhaseQuery.data, isSecondPhaseLoaded]);

  // Reset second phase when query parameters change
  useEffect(() => {
    setIsSecondPhaseLoaded(false);
  }, [tag, clientId, search]);

  // Combine tweets from both phases
  const firstPhaseTweets = firstPhaseQuery.data?.pages.flatMap((page) => page.tweets) ?? [];
  const secondPhaseTweets = secondPhaseQuery.data?.pages.flatMap((page) => page.tweets) ?? [];
  
  // Deduplicate tweets by ID (in case there's overlap)
  const allTweets = [...firstPhaseTweets];
  secondPhaseTweets.forEach(tweet => {
    if (!allTweets.some(existing => existing.id === tweet.id)) {
      allTweets.push(tweet);
    }
  });

  const isLoadingInitial = firstPhaseQuery.status === "pending";
  const isLoadingMore = secondPhaseQuery.isFetchingNextPage;
  const isEmpty = firstPhaseQuery.status === "success" && !firstPhaseTweets.length;
  const hasMore = secondPhaseQuery.hasNextPage;
  const isReachingEnd = !hasMore && isSecondPhaseLoaded;

  return {
    tweets: allTweets,
    error: firstPhaseQuery.error?.message || secondPhaseQuery.error?.message || null,
    isLoadingInitial,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
    refetch: () => {
      setIsSecondPhaseLoaded(false);
      firstPhaseQuery.refetch();
      secondPhaseQuery.refetch();
    },
    fetchNextPage: secondPhaseQuery.fetchNextPage,
    hasMore,
    isFetchingNextPage: isLoadingMore,
    isError: firstPhaseQuery.status === 'error' || secondPhaseQuery.status === 'error',
    totalTweets: allTweets.length,
    // Debug info
    _debug: {
      firstPhaseLoaded: !!firstPhaseTweets.length,
      secondPhaseEnabled: isSecondPhaseLoaded,
      firstPhaseCount: firstPhaseTweets.length,
      secondPhaseCount: secondPhaseTweets.length,
    }
  };
}

// Enhanced convenience hook with better loading states
export function useTweets(limit?: number, tag?: string, clientId?: string | null, search?: string) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["tweets", limit, tag, clientId, search],
    queryFn: ({ pageParam }) => fetchTweets({ limit, cursor: pageParam, tag, clientId, search }),
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