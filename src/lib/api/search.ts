import { Tweet } from './tweets';

export interface SearchResponse {
  tweets: Tweet[];
  hasMore: boolean;
  nextCursor: string | null;
  total: number;
  query: string;
  pagination: {
    method: 'cursor' | 'offset';
    cursor: string | null;
    offset: number;
    limit: number;
    returned: number;
  };
}

export interface SearchParams {
  query: string;
  limit?: number;
  cursor?: string | null;
  offset?: number;
}

export async function searchTweets(params: SearchParams): Promise<SearchResponse> {
  const { query, limit = 20, cursor, offset = 0 } = params;
  
  const searchParams = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (cursor) {
    searchParams.append('cursor', cursor);
  }

  const response = await fetch(`/api/search?${searchParams}`);
  
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
}

// Helper function to highlight search terms in text
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
}

// Helper function to check if search query matches author info
export function isAuthorMatch(authorName: string, authorHandle: string, searchTerm: string): boolean {
  const term = searchTerm.toLowerCase();
  return authorName.toLowerCase().includes(term) || authorHandle.toLowerCase().includes(term);
} 