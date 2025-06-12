"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { clients  } from "./client-list/clients";

// Helper function to determine grid layout based on client count
const getGridLayout = (count: number) => {
  if (count === 1) return "grid-cols-1 max-w-sm";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-2xl";
  if (count <= 4) return "grid-cols-2 max-w-4xl";
  if (count <= 6) return "grid-cols-2 sm:grid-cols-3 max-w-6xl";
  if (count <= 9) return "grid-cols-3 max-w-6xl";
  return "grid-cols-3 lg:grid-cols-4 max-w-7xl"; // For 10+ clients
};

export default function ClientCards() {
  const router = useRouter();
  const gridLayout = getGridLayout(clients.length);
  
  // Check if header animation was skipped to adjust animation timing
  const hasPlayedHeaderAnimation = typeof window !== 'undefined' && sessionStorage.getItem('headerAnimationPlayed') === 'true';
  const isFromNewsPage = typeof window !== 'undefined' && sessionStorage.getItem('fromNewsPage') === 'true';
  const shouldReduceAnimations = hasPlayedHeaderAnimation || isFromNewsPage;

  // Dynamic animation variants based on whether header animation was skipped
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldReduceAnimations ? 0.3 : 0.8,
        staggerChildren: shouldReduceAnimations ? 0.1 : 0.4,
        delayChildren: shouldReduceAnimations ? 0 : 0.2
      }
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceAnimations ? 20 : 50,
      scale: shouldReduceAnimations ? 0.95 : 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceAnimations ? 0.4 : 1.0,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceAnimations ? 40 : 80,
      scale: shouldReduceAnimations ? 0.9 : 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceAnimations ? 0.5 : 1.2,
        ease: [0.6, -0.05, 0.01, 0.99],
        type: "spring",
        stiffness: shouldReduceAnimations ? 150 : 100,
        damping: shouldReduceAnimations ? 20 : 15
      }
    }
  };

  const handleCardClick = (clientId: number) => {
    router.push(`/social-board?client=${clientId}`);
  };

  return (
    <motion.div 
      className="w-full max-w-3xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Title */}
      <motion.h1 
        className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-4 text-center select-none leading-tight px-4"
        variants={titleVariants}
      >
        Plug Into the <span className="italic font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Pulse</span> of Crypto
      </motion.h1>
      
      <motion.p 
        className="text-gray-700 text-base sm:text-lg mb-8 sm:mb-10 text-center select-none max-w-sm sm:max-w-lg mx-auto font-body px-4"
        variants={titleVariants}
      >
        Real-time streams from the voices that move markets.
      </motion.p>
      
      {/* Cards list */}
      <motion.div 
        className={`w-full mx-auto grid ${gridLayout} gap-4 sm:gap-6 px-4`}
        variants={containerVariants}
      >
        {clients.map((client) => (
          <motion.button
            key={client.id}
            className="group relative flex flex-col items-center justify-center bg-gray-50 border border-gray-500 p-6 sm:p-8 focus:outline-none transition-all duration-300 min-h-[140px] active:scale-95"
            style={{
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
            }}
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCardClick(client.id)}
          >
            {/* Icon */}
            <motion.div
              className="flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform"
            >
              <Image
                src={client.icon}
                alt={client.title}
                width={40}
                height={40}
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
            </motion.div>
            
            {/* Content */}
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg font-body mb-1 sm:mb-2 group-hover:text-gray-700 transition-colors">
                {client.title}
              </h3>
            </div>
              
            {/* Arrow indicator */}
            <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-70 transition-opacity">
              <svg 
                className="w-5 h-5 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
