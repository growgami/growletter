"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface FilterTabsProps {
  tags: string[];
  selectedTag: string;
  onSelectTag: (tag: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

const optionVariants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

// Helper function to capitalize words in a tag
function formatTagForDisplay(tag: string): string {
  if (tag === 'All') return tag;
  return tag
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function FilterTabs({ tags, selectedTag, onSelectTag }: FilterTabsProps) {
  const allTags = ["All", ...tags];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOptionSelect = (tag: string) => {
    onSelectTag(tag);
    setIsDropdownOpen(false);
  };

  return (
    <motion.div
      className="py-4 sm:py-6 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Mobile Custom Dropdown */}
      <motion.div
        className="block sm:hidden relative"
        variants={itemVariants}
      >
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-500 text-gray-900 font-medium font-body text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 cursor-pointer flex items-center justify-between"
          whileTap={{ scale: 0.98 }}
        >
          <span>{formatTagForDisplay(selectedTag)}</span>
          <motion.svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-white/90 backdrop-blur-sm border border-gray-500 shadow-lg max-h-60 overflow-auto"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {allTags.map((tag) => (
                <motion.button
                  key={tag}
                  onClick={() => handleOptionSelect(tag)}
                  className={`w-full px-4 py-3 text-left font-body text-base transition-colors duration-150 ${
                    selectedTag === tag
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  variants={optionVariants}
                  whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.8)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {formatTagForDisplay(tag)}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay to close dropdown when clicking outside */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDropdownOpen(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Desktop Tab Layout */}
      <motion.div
        className="hidden sm:flex flex-wrap justify-center items-center gap-2 sm:gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-wrap justify-center items-center gap-1 bg-white/60 backdrop-blur-sm p-1 border border-gray-500">
          {allTags.map((tag) => (
            <motion.button
              key={tag}
              onClick={() => onSelectTag(tag)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 relative font-body min-h-[44px] ${
                selectedTag === tag
                  ? "text-gray-900"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              {selectedTag === tag && (
                <motion.div
                  className="absolute inset-0 bg-white/80 backdrop-blur-sm border border-gray-600"
                  layoutId="activeFilterTab"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              )}
              <span className="relative z-10">{formatTagForDisplay(tag)}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
} 