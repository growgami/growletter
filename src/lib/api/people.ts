export interface Author {
  id: number;
  authorId: string; // Twitter author ID for upvoting
  name: string;
  handle: string;
  pfp: string;
  followers: string;
  tweets: number;
  engagement: string;
  verified: boolean;
  upvotes: number;
}

export interface AuthorsResponse {
  authors: Author[];
}

export const fetchAuthors = async (clientId?: string | null): Promise<AuthorsResponse> => {
  const url = new URL('/api/authors', window.location.origin);
  
  if (clientId) {
    url.searchParams.set('client', clientId);
  }
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Failed to fetch authors: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('📊 Fetched authors from API:', data.authors.length, clientId ? `for client ${clientId}` : 'for all clients');
  
  return data;
}

// Helper function to format upvote numbers
export const formatUpvotes = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${Math.floor(count / 1000)}K`
  }
  return count.toString()
} 