import { useQuery } from '@tanstack/react-query'
import { fetchAuthors } from '@/lib/api/people'

// Query keys for consistent caching
export const authorsKeys = {
  all: ['authors'] as const,
  list: () => [...authorsKeys.all, 'list'] as const,
}

export const useAuthorsQuery = () => {
  return useQuery({
    queryKey: authorsKeys.list(),
    queryFn: fetchAuthors,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
} 