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
  columnCount?: number;
}

export default function TwitterEmbed({ url, columnCount = 5 }: TwitterEmbedProps) {
  const tweetId = extractTweetId(url);
  const [embedWidth, setEmbedWidth] = useState(350);
  
  useEffect(() => {
    const updateEmbedWidth = () => {
      // Calculate width based on column count with responsive considerations
      let width: number;
      
      // Calculate available width per column
      const gapWidth = 8; // 2px gap between columns in CSS
      const totalGaps = (columnCount - 1) * gapWidth;
      const padding = 32; // Account for container padding
      const availableWidth = window.innerWidth - totalGaps - padding;
      const calculatedWidth = availableWidth / columnCount;
      
      // Set appropriate width limits based on column count
      switch (columnCount) {
        case 1:
          width = Math.min(calculatedWidth, 600); // Mobile: cap at reasonable max
          break;
        case 2:
          width = Math.min(calculatedWidth, 500); // Tablet: cap at reasonable max
          break;
        case 3:
          width = Math.min(calculatedWidth, 420);
          break;
        case 4:
          width = Math.min(calculatedWidth, 380);
          break;
        case 5:
          width = Math.min(calculatedWidth, 350);
          break;
        case 6:
          width = Math.min(calculatedWidth, 345);
          break;
        default:
          width = Math.min(calculatedWidth, 350);
          break;
      }
      
      // Ensure minimum width for readability
      width = Math.max(300, width);
      
      setEmbedWidth(width);
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
  }, [columnCount]);
  
  if (!tweetId) return null;
  
  return (
    <div 
      data-theme='light' 
      style={{ 
        maxWidth: embedWidth, 
        width: '100%', 
        margin: '0 auto',
        transition: 'max-width 0.2s ease-out'
      }}
    >
      <Tweet id={tweetId} />
    </div>
  );
}