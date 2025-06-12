"use client";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { useAuthorsQuery } from "@/hooks/query/usePeopleQuery";
import { useUpvotesQuery, useUpvoteMutation, useSessionUpvotesQuery, useHasUpvoted } from "@/hooks/query/useUpvotesQuery";
import { formatUpvotes, type Author } from "@/lib/api/people";
import { getUpvoteCountByAuthor } from "@/lib/api/upvotes";

// UpvoteButton component with session tracking and optimistic UI
function UpvoteButton({ 
  author, 
  onUpvote, 
  isHovered, 
  onHover, 
  onLeave 
}: {
  author: Author;
  onUpvote: (author: Author) => void;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const hasUpvoted = useHasUpvoted(author.authorId);
  const [showOptimistic, setShowOptimistic] = useState(false);
  const [optimisticCount, setOptimisticCount] = useState(author.upvotes);

  // Reset optimistic state when author changes
  useEffect(() => {
    setOptimisticCount(author.upvotes);
  }, [author.upvotes]);

  const handleClick = () => {
    if (hasUpvoted) return;
    
    // Show optimistic UI immediately
    setShowOptimistic(true);
    setOptimisticCount(prev => prev + 1);
    onUpvote(author);

    // Fade back to normal state after 2 seconds
    setTimeout(() => {
      setShowOptimistic(false);
    }, 2000);
  };

  // Determine what to show based on state
  const getButtonContent = () => {
    if (showOptimistic) {
      return "✓";
    }
    
    if (hasUpvoted) {
      if (isHovered) {
        return "✓";
      }
      return formatUpvotes(optimisticCount);
    }
    
    if (isHovered) {
      return "Upvote";
    }
    
    return formatUpvotes(optimisticCount);
  };

  // Determine button styling based on state
  const getButtonStyle = () => {
    if (showOptimistic) {
      return 'bg-green-100 border-green-400 text-green-700';
    }
    
    if (hasUpvoted) {
      if (isHovered) {
        return 'bg-green-100 border-green-400 text-green-700';
      }
      return 'bg-gray-50 border-gray-300 text-gray-600';
    }
    
    return 'bg-white/60 border-gray-500 text-gray-600 hover:text-gray-800';
  };
  
  return (
    <motion.button
      className={`w-16 h-9 backdrop-blur-sm border text-sm font-medium transition-colors font-body flex items-center justify-center ${getButtonStyle()}`}
      onClick={handleClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={hasUpvoted ? {} : { scale: 1.02 }}
      whileTap={hasUpvoted ? {} : { scale: 0.98 }}
      disabled={hasUpvoted && !isHovered}
      title={hasUpvoted ? "You've upvoted this author" : "Click to upvote"}
    >
      <motion.span 
        className="truncate"
        animate={{ 
          scale: showOptimistic ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {getButtonContent()}
      </motion.span>
    </motion.button>
  );
}

export default function AuthorTable() {
  const { data, isLoading, error } = useAuthorsQuery();
  const { data: upvotesData, isLoading: upvotesLoading } = useUpvotesQuery();
  const { isLoading: sessionLoading } = useSessionUpvotesQuery();
  const upvoteMutation = useUpvoteMutation();
  const [hoveredUpvote, setHoveredUpvote] = useState<number | null>(null);

  // Deduplicate authors and merge upvote counts
  const authorsWithUpvotes = useMemo(() => {
    const baseAuthors = data?.authors || [];
    
    // First, deduplicate by authorId and sum tweet counts
    const deduplicatedMap = new Map<string, Author>();
    
    baseAuthors.forEach(author => {
      const existing = deduplicatedMap.get(author.authorId);
      if (existing) {
        // Combine tweet counts, keep other data from first occurrence
        existing.tweets += author.tweets;
      } else {
        // First occurrence, add to map
        deduplicatedMap.set(author.authorId, { ...author });
      }
    });
    
    // Convert back to array and reassign sequential IDs
    const deduplicatedAuthors = Array.from(deduplicatedMap.values()).map((author, index) => ({
      ...author,
      id: index + 1
    }));
    
    // Then merge with upvote counts
    if (!upvotesData?.upvotes) return deduplicatedAuthors;
    
    return deduplicatedAuthors.map(author => ({
      ...author,
      upvotes: getUpvoteCountByAuthor(upvotesData.upvotes, author.authorId)
    }));
  }, [data?.authors, upvotesData?.upvotes]);

  if (error) {
    return (
      <motion.div 
        className="max-w-6xl mx-auto px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center p-8">
          <p className="text-red-600 font-body">Failed to load authors data</p>
        </div>
      </motion.div>
    );
  }

  const handleUpvote = (author: Author) => {
    upvoteMutation.mutate({
      author_id: author.authorId,
      author: author.handle,
      author_name: author.name,
    });
  };

  const handleContact = (author: Author) => {
    console.log('Contact clicked for:', author.name);
    // Redirect to X (Twitter) profile - user can then message from there
    // Note: Direct message compose requires numeric user ID, not handle
    const xProfileUrl = `https://x.com/${author.handle.replace('@', '')}`;
    window.open(xProfileUrl, '_blank');
  };

  return (
    <motion.div 
      className="max-w-6xl mx-auto px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mt-8">
        <div className="bg-white overflow-hidden shadow-lg border border-gray-200 rounded-lg">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-80" />
                <col className="w-32" />
                <col className="w-24" />
                <col className="w-20" />
                <col className="w-24" />
                <col className="w-24" />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 font-body">Author</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 font-body">Handle</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 font-body">Followers</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 font-body">Tweets</th>
                  <th id="upvote" className="px-6 py-4 text-left text-sm font-semibold text-gray-900 font-body ">Upvote</th>
                  <th id="contact"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading || upvotesLoading || sessionLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-3"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-9 bg-gray-200 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-9 bg-gray-200 rounded animate-pulse w-16"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  authorsWithUpvotes.map((author: Author, index: number) => (
                    <motion.tr
                      key={author.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {author.pfp ? (
                            <img
                              src={author.pfp}
                              alt={author.name}
                              className="w-10 h-10 rounded-full mr-3 object-cover"
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium mr-3"
                            style={{ display: author.pfp ? 'none' : 'flex' }}
                          >
                            {author.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <span className="text-gray-900 font-semibold font-body truncate">{author.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-body truncate">{author.handle}</td>
                      <td className="px-6 py-4 text-gray-600 font-body">{author.followers}</td>
                      <td className="px-6 py-4 text-gray-600 font-body">{author.tweets}</td>
                      <td className="px-6 py-4">
                        <UpvoteButton 
                          author={author} 
                          onUpvote={handleUpvote}
                          isHovered={hoveredUpvote === author.id}
                          onHover={() => setHoveredUpvote(author.id)}
                          onLeave={() => setHoveredUpvote(null)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <motion.button
                          className="w-16 h-9 bg-white/60 backdrop-blur-sm border border-gray-500 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors font-body flex items-center justify-center"
                          onClick={() => handleContact(author)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="truncate">
                            Reach
                          </span>
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!isLoading && !upvotesLoading && !sessionLoading && authorsWithUpvotes.length === 0 && (
          <div className="text-center p-8">
            <p className="text-gray-600 font-body">No authors found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
