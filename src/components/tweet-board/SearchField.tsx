"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchFieldProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  debounceMs?: number;
  isLoading?: boolean;
}

export default function SearchField({ 
  onSearch, 
  placeholder = "Search tweets, authors, or handles...",
  initialValue = "",
  debounceMs = 300,
  isLoading = false
}: SearchFieldProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch, debounceMs]);

  const handleClear = useCallback(() => {
    setSearchQuery("");
    onSearch("");
  }, [onSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <motion.div
      className="flex justify-center items-center py-4 px-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="relative w-full max-w-md">
        <div className={`relative bg-white/60 backdrop-blur-sm border transition-all duration-200 ${
          isFocused ? 'border-gray-600 shadow-sm' : 'border-gray-500'
        }`}>
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <motion.div
              animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              <MagnifyingGlassIcon 
                className={`h-5 w-5 transition-colors ${
                  isFocused ? 'text-gray-600' : 'text-gray-500'
                }`} 
              />
            </motion.div>
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none font-body text-sm"
          />

          {/* Clear Button */}
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100/50 rounded-r transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Search Results Count (optional) */}
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 right-0 mt-1 px-3 py-1 bg-white/80 backdrop-blur-sm border border-gray-300 text-xs text-gray-600 font-body rounded"
            >
              {isLoading ? "Searching..." : `Searching for "${searchQuery}"`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
