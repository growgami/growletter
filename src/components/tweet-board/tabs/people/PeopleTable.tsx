"use client";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import Image from "next/image";
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

// Row component for virtualized list
function AuthorRow({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties; 
  data: {
    authors: Author[];
    hoveredUpvote: number | null;
    setHoveredUpvote: (id: number | null) => void;
    handleUpvote: (author: Author) => void;
    handleContact: (author: Author) => void;
  }
}) {
  const { authors, hoveredUpvote, setHoveredUpvote, handleUpvote, handleContact } = data;
  const author = authors[index];

  return (
    <div style={style}>
      <motion.div
        className="border-b border-gray-100 hover:bg-gray-50 transition-colors py-4 grid grid-cols-[1fr_1px_140px_1px_80px_1px_50px_1px_64px_1px_64px] gap-2 items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.02 }}
      >
        {/* Author column */}
        <div className="flex items-center">
          {author.pfp ? (
            <div className="relative w-10 h-10 mr-3">
              <Image
                src={author.pfp}
                alt={author.name}
                fill
                className="rounded-full object-cover"
                sizes="40px"
                onError={() => {
                  // Handle error by hiding image and showing fallback
                  const imgElement = document.querySelector(`img[alt="${author.name}"]`) as HTMLElement;
                  if (imgElement) {
                    imgElement.style.display = 'none';
                    const fallback = imgElement.closest('.relative')?.nextSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }
                }}
              />
            </div>
          ) : null}
          <div 
            className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium mr-3"
            style={{ display: author.pfp ? 'none' : 'flex' }}
          >
            {author.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <span className="text-gray-900 font-semibold font-body truncate">{author.name}</span>
        </div>

        {/* Separator */}
        <div className="h-6 bg-gray-300 opacity-50"></div>

        {/* Handle column */}
        <div className="text-gray-600 font-body truncate">{author.handle}</div>

        {/* Separator */}
        <div className="h-6 bg-gray-300 opacity-50"></div>

        {/* Followers column */}
        <div className="text-gray-600 font-body">{author.followers}</div>

        {/* Separator */}
        <div className="h-6 bg-gray-300 opacity-50"></div>

        {/* Tweets column */}
        <div className="text-gray-600 font-body">{author.tweets}</div>

        {/* Separator */}
        <div className="h-6 bg-gray-300 opacity-50"></div>

        {/* Upvote column */}
        <div>
          <UpvoteButton 
            author={author} 
            onUpvote={handleUpvote}
            isHovered={hoveredUpvote === author.id}
            onHover={() => setHoveredUpvote(author.id)}
            onLeave={() => setHoveredUpvote(null)}
          />
        </div>

        {/* Separator */}
        <div className="h-6 bg-gray-300 opacity-50"></div>

        {/* Contact column */}
        <div>
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
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthorTable({ clientId }: { clientId?: string | null }) {
  const { data, isLoading, error } = useAuthorsQuery(clientId);
  const { data: upvotesData, isLoading: upvotesLoading } = useUpvotesQuery();
  const { isLoading: sessionLoading } = useSessionUpvotesQuery();
  const upvoteMutation = useUpvoteMutation();
  const [hoveredUpvote, setHoveredUpvote] = useState<number | null>(null);
  const [pendingUpvotes, setPendingUpvotes] = useState<Set<string>>(new Set());

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
    
    // Convert back to array
    const deduplicatedAuthors = Array.from(deduplicatedMap.values());
    
    // Merge with upvote counts
    const authorsWithUpvoteData = deduplicatedAuthors.map(author => ({
      ...author,
      upvotes: upvotesData?.upvotes ? getUpvoteCountByAuthor(upvotesData.upvotes, author.authorId) : 0
    }));
    
    // Sort by upvotes in descending order, but maintain order for pending upvotes
    // to prevent re-sorting during optimistic UI animation
    const sortedAuthors = authorsWithUpvoteData.sort((a, b) => {
      // If either author has a pending upvote, maintain current order
      if (pendingUpvotes.has(a.authorId) || pendingUpvotes.has(b.authorId)) {
        return 0; // Keep current order
      }
      return b.upvotes - a.upvotes;
    });
    
    // Reassign sequential IDs
    return sortedAuthors.map((author, index) => ({
      ...author,
      id: index + 1
    }));
  }, [data?.authors, upvotesData?.upvotes, pendingUpvotes]);

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
    // Add to pending upvotes to prevent re-sorting during optimistic UI
    setPendingUpvotes(prev => new Set(prev).add(author.authorId));
    
    // Remove from pending after optimistic UI animation (2 seconds)
    setTimeout(() => {
      setPendingUpvotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(author.authorId);
        return newSet;
      });
    }, 2000);
    
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
          {/* Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="mx-4 grid grid-cols-[1fr_1px_140px_1px_80px_1px_50px_1px_64px_1px_64px] gap-2 items-center">
              <div className="text-left text-sm font-semibold text-gray-900 font-body">Author</div>
              <div className="h-6 bg-gray-300 opacity-50"></div>
              <div className="text-left text-sm font-semibold text-gray-900 font-body">Handle</div>
              <div className="h-6 bg-gray-300 opacity-50"></div>
              <div className="text-left text-sm font-semibold text-gray-900 font-body">Followers</div>
              <div className="h-6 bg-gray-300 opacity-50"></div>
              <div className="text-left text-sm font-semibold text-gray-900 font-body">Tweets</div>
              <div className="h-6 bg-gray-300 opacity-50"></div>
              <div className="text-left text-sm font-semibold text-gray-900 font-body">Upvote</div>
              <div className="h-6 bg-gray-300 opacity-50"></div>
              <div></div>
            </div>
          </div>

          {/* Virtualized List */}
          {isLoading || upvotesLoading || sessionLoading ? (
            // Loading skeleton
            <div>
                             {Array.from({ length: 5 }).map((_, index) => (
                 <div key={index} className="border-b border-gray-100 px-6 py-4 grid grid-cols-[1fr_1px_140px_1px_80px_1px_50px_1px_64px_1px_64px] gap-2 items-center">
                   <div className="flex items-center">
                     <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-3"></div>
                     <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                   </div>
                   <div className="h-6 bg-gray-300 opacity-50"></div>
                   <div>
                     <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                   </div>
                   <div className="h-6 bg-gray-300 opacity-50"></div>
                   <div>
                     <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                   </div>
                   <div className="h-6 bg-gray-300 opacity-50"></div>
                   <div>
                     <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                   </div>
                   <div className="h-6 bg-gray-300 opacity-50"></div>
                   <div>
                     <div className="h-9 bg-gray-200 rounded animate-pulse w-16"></div>
                   </div>
                   <div className="h-6 bg-gray-300 opacity-50"></div>
                   <div>
                     <div className="h-9 bg-gray-200 rounded animate-pulse w-16"></div>
                   </div>
                 </div>
               ))}
            </div>
          ) : authorsWithUpvotes.length > 0 ? (
            <div className="px-6">
              <List
                height={600} // Fixed height for virtualization
                itemCount={authorsWithUpvotes.length}
                itemSize={76} // Height of each row (py-4 = 16px + content ~44px)
                itemData={{
                  authors: authorsWithUpvotes,
                  hoveredUpvote,
                  setHoveredUpvote,
                  handleUpvote,
                  handleContact
                }}
              >
                {AuthorRow}
              </List>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-600 font-body">No authors found</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
