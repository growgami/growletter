import React from 'react';

interface EmbedSkeletonProps {
  className?: string;
}

export function EmbedSkeleton({ className = '' }: EmbedSkeletonProps) {
  return (
    <div className={`w-full min-h-[200px] p-4 bg-gray-50 border border-gray-200 rounded-lg animate-pulse ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Avatar skeleton */}
        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
        
        <div className="flex-1 space-y-3">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
            <div className="h-3 bg-gray-300 rounded w-24"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-4/5"></div>
            <div className="h-4 bg-gray-300 rounded w-3/5"></div>
          </div>
          
          {/* Media skeleton */}
          <div className="h-32 bg-gray-300 rounded mt-4"></div>
          
          {/* Footer skeleton */}
          <div className="flex space-x-4 mt-4">
            <div className="h-3 bg-gray-300 rounded w-12"></div>
            <div className="h-3 bg-gray-300 rounded w-12"></div>
            <div className="h-3 bg-gray-300 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmbedSkeleton; 