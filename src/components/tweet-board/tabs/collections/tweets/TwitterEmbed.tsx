"use client";

import { Tweet } from "react-tweet";
import { useEffect, useState } from "react";

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
  const [embedWidth, setEmbedWidth] = useState(380); // Default for 5 columns
  
  useEffect(() => {
    const updateEmbedWidth = () => {
      if (typeof window === 'undefined') return;
      
      const width = window.innerWidth;
      const devicePixelRatio = window.devicePixelRatio || 1;
      const isHighlyScaled = devicePixelRatio >= 1.4; // 150% scale or higher
      const isMediumScaled = devicePixelRatio > 1.1 && devicePixelRatio < 1.4; // 125% scale
      
      // Match the breakpoint logic from useMasonryLayout
      if (width < 768) {
        setEmbedWidth(290); // 1 column
      } else if (width < 1024 && width >= 768) {
        setEmbedWidth(425); // 2 columns
      } else if (width < 1366 || isHighlyScaled) {
        setEmbedWidth(400); // 3 columns
      } else if (width < 1600 || isMediumScaled) {
        setEmbedWidth(400); // 4 columns
      } else if (width >= 1920 && devicePixelRatio <= 1.1) {
        setEmbedWidth(420); // 5 columns
      } else {
        setEmbedWidth(400); // fallback for edge cases
      }
    };

    // Set initial width
    updateEmbedWidth();
    
    // Listen for resize events with debouncing
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateEmbedWidth, 150);
    };

    window.addEventListener('resize', debouncedUpdate);
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);
  
  if (!tweetId) return null;
  return (
    <div data-theme='light' style={{ maxWidth: embedWidth, width: '100%', margin: '0 auto'}}>
      <Tweet id={tweetId} />
    </div>
  );
}