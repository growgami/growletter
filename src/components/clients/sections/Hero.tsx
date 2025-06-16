"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

interface HeroProps {
  onClientCardsBottomReached?: (reached: boolean) => void;
}

export default function Hero({ onClientCardsBottomReached }: HeroProps) {
  const [shouldReduceAnimations, setShouldReduceAnimations] = useState(false);

  useEffect(() => {
    // Check if header animation was skipped to adjust animation timing
    const hasPlayedHeaderAnimation = sessionStorage.getItem('headerAnimationPlayed') === 'true';
    const isFromNewsPage = sessionStorage.getItem('fromNewsPage') === 'true';
    setShouldReduceAnimations(hasPlayedHeaderAnimation || isFromNewsPage);
  }, []);

  useEffect(() => {
    if (!onClientCardsBottomReached) return;

    // Wait for the ClientCards section to be available
    const checkForClientCards = () => {
      const clientCardsSection = document.getElementById('client-cards');
      if (!clientCardsSection) {
        console.log('ClientCards section not found, retrying...');
        // If section doesn't exist yet, try again after a short delay
        setTimeout(checkForClientCards, 100);
        return;
      }

      console.log('Setting up ScrollTrigger for ClientCards section');

      // Create ScrollTrigger to detect when ClientCards section reaches the middle of viewport
      const trigger = ScrollTrigger.create({
        trigger: clientCardsSection,
        start: "top center", // When the top of the element hits the center of the viewport
        onEnter: () => {
          console.log('ScrollTrigger onEnter - showing navbar');
          onClientCardsBottomReached(true);
        },
        onLeave: () => {
          console.log('ScrollTrigger onLeave - hiding navbar');
          onClientCardsBottomReached(false);
        },
        onEnterBack: () => {
          console.log('ScrollTrigger onEnterBack - showing navbar');
          onClientCardsBottomReached(true);
        },
        onLeaveBack: () => {
          console.log('ScrollTrigger onLeaveBack - hiding navbar');
          onClientCardsBottomReached(false);
        }
      });

      return trigger;
    };

    const trigger = checkForClientCards();

    // Cleanup function
    return () => {
      if (trigger && typeof trigger.kill === 'function') {
        trigger.kill();
      }
    };
  }, [onClientCardsBottomReached]);

  const scrollToClientCards = () => {
    const clientCardsSection = document.getElementById('client-cards');
    if (clientCardsSection) {
      // Calculate the bottom position of the ClientCards section
      const rect = clientCardsSection.getBoundingClientRect();
      const elementBottom = window.scrollY + rect.bottom;
      
      // Use GSAP scrollTo in one smooth motion to the bottom
      gsap.to(window, {
        duration: 2.0,
        scrollTo: elementBottom - window.innerHeight + 100, // 100px padding from bottom
        ease: "power2.inOut"
      });
    }
  };

  // Animation variants matching ClientCards
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

  const buttonVariants = {
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

  return (
    <motion.section 
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-5xl mx-auto">
        {/* Text Content */}
        <motion.div 
          className="space-y-6 mb-12"
          variants={titleVariants}
        >
          {/* Main Title */}
          <h1 className="font-heading text-5xl sm:text-6xl md:text-8xl font-bold text-gray-900 leading-tight select-none">
            Wall of <span className="italic font-bold tracking-wider" style={{ fontFamily: "'Playfair Display', serif" }}>Creators</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-body select-none">
            <span className="font-bold tracking-wide  ">Growgami</span> Curated Creators
          </p>
        </motion.div>
        
        {/* CTA Button */}
        <motion.div 
          className="flex justify-center"
          variants={buttonVariants}
        >
          <motion.button
            onClick={scrollToClientCards}
            className="px-8 py-3 bg-white/60 backdrop-blur-sm border border-gray-500 text-lg font-medium text-gray-700 hover:text-gray-900 transition-all duration-200 font-body min-h-[44px]"
            style={{
              boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.2)'
            }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.25)'
            }}
            whileTap={{ 
              scale: 0.98,
              boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.15)'
            }}
          >
            The Wall
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
}
