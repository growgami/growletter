"use client";

import { Tweet } from "react-tweet";
import { useEffect, useState, useRef } from "react";

// Utility function to extract tweet ID from a Twitter/X URL
function extractTweetId(url: string): string | null {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
  return match ? match[1] : null;
}

interface TwitterEmbedProps {
  url: string;
  columnCount?: number;
  onLoad?: () => void;
}

export default function TwitterEmbed({ url, columnCount = 5, onLoad }: TwitterEmbedProps) {
  const tweetId = extractTweetId(url);
  const [embedWidth, setEmbedWidth] = useState(350);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const onLoadRef = useRef(onLoad);
  
  // Keep onLoad callback ref up to date
  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);
  
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

  // Monitor for tweet load completion
  useEffect(() => {
    if (!containerRef.current || isLoaded) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const tweetElement = containerRef.current?.querySelector('[data-tweet-id], .react-tweet-theme, .tweet');
          if (tweetElement && !isLoaded) {
            // Check if the tweet content is actually rendered
            const hasContent = tweetElement.textContent && tweetElement.textContent.trim().length > 0;
            if (hasContent) {
              setIsLoaded(true);
              // Call onLoad callback after a short delay to ensure rendering is complete
              setTimeout(() => {
                onLoadRef.current?.();
              }, 100);
            }
          }
        }
      });
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    // Fallback timeout in case MutationObserver doesn't catch the load
    const fallbackTimeout = setTimeout(() => {
      if (!isLoaded) {
        setIsLoaded(true);
        onLoadRef.current?.();
      }
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimeout);
    };
  }, [tweetId, isLoaded]);
  
  if (!tweetId) return null;
  
  return (
    <div 
      ref={containerRef}
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