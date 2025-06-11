"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Client {
  id: number;
  title: string;
  gradient: string;
  icon: string;
}

const clients: Client[] = [
  {
    id: 1,
    title: "Polygon",
    gradient: "from-gray-900 via-gray-700 to-gray-400",
    icon: "/assets/logos/polygon.svg"
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      staggerChildren: 0.4,
      delayChildren: 0.2
    }
  }
};

const titleVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.0,
      ease: [0.6, -0.05, 0.01, 0.99] // Custom cubic-bezier for smooth bounce
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 80,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.6, -0.05, 0.01, 0.99],
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function ClientCards() {
  const router = useRouter();

  const handleCardClick = (clientId: number) => {
    router.push(`/social-board?client=${clientId}`);
  };

  return (
    <motion.div 
      className="w-full max-w-2xl"
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
        className="w-full max-w-2xl mx-auto flex justify-center px-4"
        variants={containerVariants}
      >
        {clients.map((client) => (
          <motion.button
            key={client.id}
            className="group relative flex flex-col items-center justify-center bg-gray-50 border border-gray-500 p-6 sm:p-8 focus:outline-none transition-all duration-300 min-h-[140px] active:scale-95 w-full max-w-sm"
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
            {/* Icon without background */}
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
              
            {/* More visible arrow indicator */}
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
