"use client";

import { Tweet } from "react-tweet";

// Utility function to extract tweet ID from a Twitter/X URL
function extractTweetId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

interface TwitterEmbedProps {
  url: string;
}

export default function TwitterEmbed({ url }: TwitterEmbedProps) {
  const tweetId = extractTweetId(url);
  if (!tweetId) return null;
  return (
    <div data-theme='light' style={{ maxWidth: 500, width: '100%', margin: '0 auto'}}>
          <Tweet id={tweetId} />
    </div>
  );
}