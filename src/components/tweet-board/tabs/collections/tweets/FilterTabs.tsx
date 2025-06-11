"use client";

import { motion } from "framer-motion";

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

  return (
    <motion.div
      className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 py-4 sm:py-6 px-4"
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
  );
} 