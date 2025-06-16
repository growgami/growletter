import type { MasonryItem } from "@/hooks/layouts/useMasonryLayout";

export interface Tweet extends MasonryItem {
  id: string;
  title: string;
  embedType: 'twitter' | 'video' | 'iframe' | 'image';
  embedUrl: string;
  createdAt: string;
  banner?: string;
  alt?: string;
}

export interface TweetsResponse {
  tweets: Tweet[];
  hasMore: boolean;
  nextCursor: string | null;
  total: number;
  pagination: {
    method: 'cursor' | 'offset';
    cursor: string | null;
    offset: number;
    limit: number;
    returned: number;
  };
}

export interface FetchTweetsParams {
  limit?: number;
  cursor?: string | null;
  tag?: string;
  clientId?: string | null;
  search?: string; // Add search parameter
}

export const fetchTweets = async ({ limit, cursor, tag, clientId, search }: FetchTweetsParams): Promise<TweetsResponse> => {
  const params = new URLSearchParams();
  
  // Only append limit if explicitly provided, let API route handle default (12)
  if (limit !== undefined) {
    params.append('limit', String(limit));
  }

  if (cursor) {
    params.append('cursor', cursor);
  }

  if (tag && tag !== 'All') {
    params.append('tag', tag);
  }

  if (clientId) {
    params.append('client', clientId);
  }

  if (search?.trim()) {
    params.append('search', search.trim());
  }

  const response = await fetch(`/api/tweets?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tweets: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('📊 Fetched tweets from API:', data.tweets.length);
  
  return data;
}

export async function fetchInfiniteTweets({ 
  pageParam = null, 
  limit = 15,
  clientId 
}: { 
  pageParam?: string | null; 
  limit?: number; 
  clientId?: string | null;
}): Promise<TweetsResponse> {
  return fetchTweets({ limit, cursor: pageParam, clientId });
} 