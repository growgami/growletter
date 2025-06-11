import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUpvotes, submitUpvote, type UpvoteRequest, type UpvoteData } from '@/lib/api/upvotes';

// Query keys for cache management
export const upvotesKeys = {
  all: ['upvotes'] as const,
  list: () => [...upvotesKeys.all, 'list'] as const,
  session: () => [...upvotesKeys.all, 'session'] as const,
};

// Hook to fetch all upvotes
export const useUpvotesQuery = () => {
  return useQuery({
    queryKey: upvotesKeys.list(),
    queryFn: fetchUpvotes,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to track session upvotes (authors the user has upvoted in current session)
export const useSessionUpvotesQuery = () => {
  return useQuery({
    queryKey: upvotesKeys.session(),
    queryFn: () => {
      // Check if we're in the browser
      if (typeof window === 'undefined') return [];
      
      // Try to get from sessionStorage first
      const sessionUpvotes = sessionStorage.getItem('upvoted_authors');
      return sessionUpvotes ? JSON.parse(sessionUpvotes) : [];
    },
    staleTime: Infinity, // Never goes stale during session
    gcTime: Infinity, // Keep in cache for entire session
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

// Hook to check if user has already upvoted an author in current session
export const useHasUpvoted = (authorId: string): boolean => {
  const { data: sessionUpvotes = [] } = useSessionUpvotesQuery();
  return sessionUpvotes.includes(authorId);
};

// Hook to submit an upvote
export const useUpvoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (upvoteData: UpvoteRequest) => {
      return submitUpvote(upvoteData);
    },
    onMutate: async (newUpvote: UpvoteRequest) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: upvotesKeys.list() });
      await queryClient.cancelQueries({ queryKey: upvotesKeys.session() });

      // Snapshot the previous values
      const previousUpvotes = queryClient.getQueryData(upvotesKeys.list());
      const previousSessionUpvotes = queryClient.getQueryData(upvotesKeys.session()) || [];

      // Optimistically update the session upvotes
      const newSessionUpvotes = [...(previousSessionUpvotes as string[]), newUpvote.author_id];
      queryClient.setQueryData(upvotesKeys.session(), newSessionUpvotes);
      
      // Update sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('upvoted_authors', JSON.stringify(newSessionUpvotes));
      }

      // Optimistically update the upvotes cache
      queryClient.setQueryData(upvotesKeys.list(), (old: { upvotes: UpvoteData[] } | undefined) => {
        if (!old?.upvotes) return old;

        const existingUpvoteIndex = old.upvotes.findIndex(
          (upvote: UpvoteData) => upvote.author_id === newUpvote.author_id
        );

        if (existingUpvoteIndex >= 0) {
          // Update existing upvote
          const updatedUpvotes = [...old.upvotes];
          updatedUpvotes[existingUpvoteIndex] = {
            ...updatedUpvotes[existingUpvoteIndex],
            upvote_count: updatedUpvotes[existingUpvoteIndex].upvote_count + 1,
          };
          return { ...old, upvotes: updatedUpvotes };
        } else {
          // Add new upvote
          const newUpvoteData: UpvoteData = {
            _id: `temp-${newUpvote.author_id}`,
            author_id: newUpvote.author_id,
            author: newUpvote.author,
            author_name: newUpvote.author_name,
            upvote_count: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { ...old, upvotes: [...old.upvotes, newUpvoteData] };
        }
      });

      return { previousUpvotes, previousSessionUpvotes };
    },
    onError: (err, newUpvote, context) => {
      // Rollback on error
      if (context?.previousUpvotes) {
        queryClient.setQueryData(upvotesKeys.list(), context.previousUpvotes);
      }
      if (context?.previousSessionUpvotes) {
        queryClient.setQueryData(upvotesKeys.session(), context.previousSessionUpvotes);
        // Rollback sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('upvoted_authors', JSON.stringify(context.previousSessionUpvotes));
        }
      }
    },
    onSuccess: () => {
      // Ensure sessionStorage is updated on success
      if (typeof window !== 'undefined') {
        const currentSessionUpvotes: string[] = queryClient.getQueryData(upvotesKeys.session()) || [];
        sessionStorage.setItem('upvoted_authors', JSON.stringify(currentSessionUpvotes));
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: upvotesKeys.list() });
    },
  });
}; 