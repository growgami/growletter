import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { clients } from "../../../constants/client-list/clients";
import { arrangeClients } from "../../../constants/client-list/clientCardsConfig";

// Helper function to determine grid layout based on client count
const getGridLayout = (count: number) => {
  if (count === 1) return "grid-cols-1 max-w-sm";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-2xl";
  if (count <= 4) return "grid-cols-2 max-w-4xl";
  if (count <= 6) return "grid-cols-2 sm:grid-cols-3 max-w-6xl";
  if (count <= 9) return "grid-cols-3 max-w-6xl";
  return "grid-cols-3 lg:grid-cols-4 max-w-7xl"; // For 10+ clients
};

interface ClientCardsProps {
  startAnimation?: boolean;
}

export default function ClientCards({ startAnimation = false }: ClientCardsProps) {
  const router = useRouter();
  
  // Arrange clients based on configuration
  const arrangedClients = arrangeClients(clients);
  
  const gridLayout = getGridLayout(arrangedClients.length);
  const [/*shouldReduceAnimations*/, setShouldReduceAnimations] = useState(false);

  useEffect(() => {
    // Check if header animation was skipped to adjust animation timing
    const hasPlayedHeaderAnimation = sessionStorage.getItem('headerAnimationPlayed') === 'true';
    const isFromNewsPage = sessionStorage.getItem('fromNewsPage') === 'true';
    setShouldReduceAnimations(hasPlayedHeaderAnimation || isFromNewsPage);
  }, []);
  
  // Dynamic animation variants based on whether header animation was skipped
  const containerVariants = {
    hidden: { 
      opacity: 0,
      transition: {
        when: "afterChildren"
      }
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.15,
        staggerChildren: 0.05,
        delayChildren: 0,
        when: "beforeChildren"
      }
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: [0.6, -0.05, 0.01, 0.99],
        type: "spring",
        stiffness: 200,
        damping: 25
      }
    }
  };

  const handleCardClick = (clientId: number) => {
    router.push(`/social-board?client=${clientId}`);
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <motion.div 
        className="w-full max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate={startAnimation ? "visible" : "hidden"}
      >
        {/* Text Content */}
        <motion.div 
          className="text-center space-y-4 mb-4 sm:mb-10"
          variants={titleVariants}
        >
          {/* Page Title */}
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-gray-900 leading-tight select-none px-4">
            Plug Into the <span className="italic font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Pulse</span> of Crypto
          </h1>
          
          <p className="text-gray-700 text-base sm:text-lg select-none max-w-sm sm:max-w-lg mx-auto font-body px-4">
            Real-time streams from the voices that move markets.
          </p>
        </motion.div>
        
        {/* Cards list */}
        <motion.div 
          className={`w-full mx-auto grid ${gridLayout} gap-2 sm:gap-6 px-4`}
          variants={containerVariants}
        >
          {arrangedClients.map((client) => {
            return (
              <motion.button
                key={client.id}
                className="group relative flex flex-col items-center justify-center bg-gray-50 border border-gray-500 p-2 sm:p-8 focus:outline-none transition-all duration-300 min-h-[80px] sm:min-h-[140px] active:scale-95 hover:shadow-lg"
                style={{
                  boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.2)'
                }}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.25)'
                }}
                whileTap={{ 
                  scale: 0.98,
                  boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.15)'
                }}
                onClick={() => handleCardClick(client.id)}
              >
                {/* Icon */}
                <motion.div
                  className="flex items-center justify-center mb-1 sm:mb-4 transition-transform group-hover:scale-105"
                >
                  <Image
                    src={client.icon}
                    alt={client.title}
                    width={40}
                    height={40}
                    className="w-6 h-6 sm:w-12 sm:h-12"
                  />
                </motion.div>
                
                {/* Content */}
                <div className="text-center">
                  <h3 className="font-semibold text-xs sm:text-lg font-body mb-0 sm:mb-2 transition-colors leading-tight text-gray-900 group-hover:text-gray-700">
                    {client.title}
                  </h3>
                </div>
                  
                {/* Arrow indicator */}
                <div className="absolute top-1 right-1 sm:top-4 sm:right-4 transition-opacity opacity-40 group-hover:opacity-70">
                  <svg 
                    className="w-3 h-3 sm:w-5 sm:h-5 text-gray-500" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
