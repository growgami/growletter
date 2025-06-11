import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { searchTweets, type SearchParams, type SearchResponse } from '@/lib/api/search';

// Hook for basic search query
export function useSearchQuery(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: ['search', params.query, params.limit, params.offset],
    queryFn: () => searchTweets(params),
    enabled: enabled && !!params.query?.trim(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for infinite search query with pagination
export function useInfiniteSearchQuery(
  query: string, 
  limit = 20,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: ['search', 'infinite', query, limit],
    queryFn: ({ pageParam }) => 
      searchTweets({ 
        query, 
        limit, 
        cursor: pageParam 
      }),
    enabled: enabled && !!query?.trim(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: SearchResponse) => 
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for search suggestions (could be used for autocomplete)
export function useSearchSuggestionsQuery(partialQuery: string, enabled = true) {
  return useQuery({
    queryKey: ['search', 'suggestions', partialQuery],
    queryFn: () => searchTweets({ 
      query: partialQuery, 
      limit: 5 // Just get a few results for suggestions
    }),
    enabled: enabled && partialQuery.length >= 2, // Only search after 2 characters
    staleTime: 1000 * 60 * 2, // 2 minutes for suggestions
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
} 