"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import TwitterEmbed from "./TwitterEmbed";
import FilterTabs from "./FilterTabs";
import SearchField from "@/components/tweet-board/SearchField";
import { useProgressiveTweets } from "@/hooks/query/useTweetsQuery";
import { useInfiniteScroll } from "@/hooks/layouts/useInfiniteScroll";
import { useMasonryLayout } from "@/hooks/layouts/useMasonryLayout";
import { type Tweet } from "@/lib/api/tweets";

// TypeScript: Augment Window to allow twttrLoaded property
declare global {
  interface Window {
    twttrLoaded?: boolean;
    twttr?: {
      ready: (callback: () => void) => void;
      events: {
        bind: (event: string, callback: () => void) => void;
        unbind: (event: string, callback: () => void) => void;
      };
    };
  }
}

interface TweetBoardProps {
  clientId: string | null;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.05, // Faster stagger for masonry
      delayChildren: 0.1
    }
  }
};

const columnVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// Special variant for new items being added
const newItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: 0.1
    }
  }
};

const loadingIndicatorVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

const TWEET_TAGS = [
  "what's new",
  "built on ecosystem",
  "under the hood",
  "money & markets",
  "voices & vibes",
];

export default function TweetBoard({ clientId }: TweetBoardProps) {
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    tweets,
    isLoadingInitial,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
    error,
    isError,
    refetch,
    fetchNextPage,
    hasMore,
    isFetchingNextPage,
    totalTweets,
    _debug
  } = useProgressiveTweets(selectedTag === "All" ? undefined : selectedTag, clientId, searchQuery || undefined);

  // Track previous tweet count to identify new items
  const previousTweetCountRef = useRef(0);
  const isFirstRenderRef = useRef(true);

  // Set up masonry layout
  const { columns, columnCount, isInitialized, isMounted, isReady, redistributeLayout, forceReLayout } = useMasonryLayout({ 
    items: tweets
  });

  // Set up infinite scroll
  const { triggerRef } = useInfiniteScroll({
    hasNextPage: hasMore,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: '300px', // Start loading when 300px from bottom
  });

  // Track when new items are added
  useEffect(() => {
    if (!isFirstRenderRef.current && tweets.length > previousTweetCountRef.current) {
      console.log('🆕 New tweets added:', {
        previous: previousTweetCountRef.current,
        current: tweets.length,
        newCount: tweets.length - previousTweetCountRef.current
      });
    }
    previousTweetCountRef.current = tweets.length;
    isFirstRenderRef.current = false;
  }, [tweets.length]);

  // Force layout recalculation when filter or search changes
  useEffect(() => {
    if (isReady && tweets.length > 0) {
      console.log('🔄 Filter/search changed, forcing layout recalculation');
      const timeout = setTimeout(() => {
        forceReLayout();
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [selectedTag, searchQuery, forceReLayout, isReady]);

  // Handle Twitter embed loading completion to redistribute layout if needed
  useEffect(() => {
    const handleTwitterLoaded = () => {
      console.log('🐦 Twitter embeds loaded, checking if layout redistribution is needed');
      // Small delay to ensure embeds are fully rendered
      setTimeout(() => {
        redistributeLayout();
      }, 500);
    };

    // Listen for Twitter widget loading
    if (typeof window !== 'undefined' && window.twttr) {
      window.twttr.ready(() => {
        window.twttr.events.bind('rendered', handleTwitterLoaded);
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.twttr) {
        window.twttr.ready(() => {
          window.twttr.events.unbind('rendered', handleTwitterLoaded);
        });
      }
    };
  }, [redistributeLayout]);

  console.log('📋 TweetBoard component rendered with clientId:', clientId);
  console.log('📊 Tweets state:', { 
    selectedTag,
    searchQuery,
    totalTweets, 
    tweetsLength: tweets.length,
    isLoadingInitial, 
    isLoadingMore, 
    hasMore, 
    isEmpty, 
    isReachingEnd,
    columnCount,
    isInitialized,
    isMounted,
    isReady,
    columnsDistribution: columns.map(col => col.length),
    // Debug: first few tweet IDs to see if filtering is working
    firstFewTweetIds: tweets.slice(0, 3).map(t => ({ id: t.id, tag: (t as unknown as { tag: string }).tag })),
    // Progressive loading debug
    progressiveDebug: _debug
  });

  const renderMedia = (article: Tweet) => {
    console.log('🎨 Rendering media for article:', {
      id: article.id,
      title: article.title,
      embedType: article.embedType,
      embedUrl: article.embedUrl,
      hasBanner: !!article.banner
    });
    
    if (article.embedUrl) {
      return (
        <div className="w-full">
          {article.embedType === 'twitter' ? (
            <div className="shadow-[0_0_0.5px_1px_gray] rounded-xl my-2">
              <TwitterEmbed 
                url={article.embedUrl} 
                columnCount={columnCount}
                onLoad={() => {
                  // Individual embed load handler - could be used for more granular control
                  console.log('🐦 Individual Twitter embed loaded:', article.id);
                }}
              />
            </div>
          ) : article.embedType === 'image' ? (
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={article.embedUrl}
                alt={article.alt || article.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('🖼️ Image loaded:', article.id);
                }}
              />
            </div>
          ) : (
            <div className="shadow-[0_0_0.5px_1px_gray] my-2">
              <TwitterEmbed 
                url={article.embedUrl} 
                columnCount={columnCount}
                onLoad={() => {
                  console.log('🔗 Embed loaded:', article.id);
                }}
              />
            </div>
          )}
        </div>
      );
    }

    if (article.banner) {
      return (
        <div className="relative w-full aspect-[16/9]">
          <Image
            src={article.banner}
            alt={article.alt || article.title}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('🖼️ Banner loaded:', article.id);
            }}
          />
        </div>
      );
    }

    // Fallback empty div with minimum height
    return (
      <div className="w-full min-h-[200px]" />
    );
  };

  // Render content based on state
  const renderTweetContent = () => {
    // Initial loading state - show until both mounted, ready and data loaded
    if (isLoadingInitial || !isMounted || !isReady) {
      return (
        <motion.div
          className="px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex justify-center items-center py-16">
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-lg">
                {!isMounted ? 'Initializing...' : !isReady ? 'Preparing layout...' : 'Loading tweets...'}
              </span>
            </div>
          </div>
        </motion.div>
      );
    }

    // Empty state
    if (isEmpty) {
      return (
        <motion.div
          className="px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center py-16">
            {searchQuery ? (
              <div className="space-y-2">
                <p className="text-gray-500 text-lg">No tweets found for &quot;{searchQuery}&quot;</p>
                <p className="text-gray-400 text-sm">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <p className="text-gray-500 text-lg">No tweets found.</p>
            )}
          </div>
        </motion.div>
      );
    }

    // Error state
    if (isError) {
      return (
        <motion.div 
          className="px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </motion.div>
      );
    }

    // Main content with tweets - comprehensive loading states
    return (
      <section id="tweet-board" className="px-4 w-full">
        <motion.div
          key={`${selectedTag}-${searchQuery}`} // Include searchQuery to trigger re-animation on search
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Show different states based on initialization progress */}
          {tweets.length > 0 && !isInitialized ? (
            <motion.div
              className="text-center py-8 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-pulse">Organizing layout...</div>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            </motion.div>
          ) : tweets.length > 0 && isInitialized && columns.length > 0 ? (
            <motion.div
              className="flex gap-2"
              variants={containerVariants}
              key={`masonry-${columnCount}`} // Re-trigger animation on column count change
            >
              {columns.map((columnTweets, columnIndex) => (
                <motion.div
                  key={`col-${columnIndex}-${columnCount}`} // Ensure proper key for column changes
                  className="flex-1 -space-y-4"
                  variants={columnVariants}
                >
                  {columnTweets.map((tweet, itemIndex) => {
                    const globalIndex = tweets.findIndex(t => t.id === tweet.id);
                    const isNew = globalIndex >= previousTweetCountRef.current && !isFirstRenderRef.current;
                    
                    return (
                      <motion.div
                        key={`${columnIndex}-${tweet.id}`}
                        className="w-full"
                        variants={isNew ? newItemVariants : itemVariants}
                        initial={isNew ? "hidden" : false}
                        animate="visible"
                        // Add slight delay based on column and item position for staggered effect
                        custom={columnIndex * 0.1 + itemIndex * 0.05}
                      >
                        {renderMedia(tweet as Tweet)}
                      </motion.div>
                    );
                  })}
                </motion.div>
              ))}
            </motion.div>
          ) : tweets.length > 0 ? (
            <motion.div
              className="text-center py-8 text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-pulse">Preparing layout...</div>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            </motion.div>
          ) : null}

          {/* Loading more indicator */}
          {isLoadingMore && (
            <motion.div
              className="flex justify-center items-center py-8"
              variants={loadingIndicatorVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span>Loading more tweets...</span>
              </div>
            </motion.div>
          )}

          {/* Infinite scroll trigger - invisible element */}
          {hasMore && !isLoadingMore && isInitialized && (
            <div 
              ref={triggerRef} 
              className="h-10 w-full"
              aria-hidden="true"
            />
          )}

          {/* End of content indicator */}
          {isReachingEnd && tweets.length > 0 && isInitialized && (
            <motion.div 
              className="text-center py-8 text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="h-px bg-gray-300 flex-1 max-w-20"></div>
                <span className="text-sm">You&apos;ve reached the end</span>
                <div className="h-px bg-gray-300 flex-1 max-w-20"></div>
              </div>
            </motion.div>
          )}

          {/* Stats footer */}
          {tweets.length > 0 && isInitialized && (
            <motion.div 
              className="text-center mt-8 text-gray-500 text-sm space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p>
                {searchQuery ? `Found ${totalTweets} tweets for "${searchQuery}"` : `Total tweets loaded: ${totalTweets}`}
              </p>
              <p>Distributed across {columnCount} columns</p>
              {searchQuery && selectedTag !== "All" && (
                <p>Filtered by tag: {selectedTag}</p>
              )}
            </motion.div>
          )}
        </motion.div>
      </section>
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="max-w-[96rem] mx-auto">
      <FilterTabs
        tags={TWEET_TAGS}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
      />

      <SearchField
        onSearch={handleSearch}
        placeholder="Search tweets, authors, or handles..."
        isLoading={isLoadingInitial || isLoadingMore}
      />

      {/* TWEET BOARD SECTION */}
      <div style={{ position: "relative", width: "100%" }}>
        {renderTweetContent()}
      </div>
    </div>
  );
}
