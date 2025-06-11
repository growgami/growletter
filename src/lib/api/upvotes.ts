import axios from 'axios';

export interface UpvoteData {
  _id: string;
  author_id: string;
  author: string;
  author_name: string;
  upvote_count: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpvotesResponse {
  success: boolean;
  upvotes: UpvoteData[];
}

export interface UpvoteRequest {
  author_id: string;
  author: string;
  author_name: string;
}

export interface UpvoteResponse {
  success: boolean;
  upvote: UpvoteData;
  message: string;
}

// Fetch all upvotes
export const fetchUpvotes = async (): Promise<UpvotesResponse> => {
  const response = await axios.get('/api/upvotes');
  return response.data;
};

// Submit an upvote for an author
export const submitUpvote = async (upvoteData: UpvoteRequest): Promise<UpvoteResponse> => {
  const response = await axios.post('/api/upvotes', upvoteData);
  return response.data;
};

// Helper function to get upvote count for a specific author
export const getUpvoteCountByAuthor = (upvotes: UpvoteData[], authorId: string): number => {
  const upvote = upvotes.find(u => u.author_id === authorId);
  return upvote ? upvote.upvote_count : 0;
}; 