import { useQuery } from '@tanstack/react-query'
import { fetchAuthors } from '@/lib/api/people'

// Query keys for consistent caching
export const authorsKeys = {
  all: ['authors'] as const,
  list: (clientId?: string | null) => [...authorsKeys.all, 'list', clientId] as const,
}

export const useAuthorsQuery = (clientId?: string | null) => {
  return useQuery({
    queryKey: authorsKeys.list(clientId),
    queryFn: () => fetchAuthors(clientId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
} 