"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import ClientCards from "@/components/clients/sections/ClientCards";
import Header from "@/components/clients/Header";
// import Hero from "@/components/clients/sections/Hero";

export default function PageContent() {
  const [showClientCards, setShowClientCards] = useState(true); // Show immediately
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [showNavbar, /*setShowNavbar*/] = useState(true); // Show immediately
  const [startClientCardsAnimation, setStartClientCardsAnimation] = useState(true); // Start immediately
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if coming from news page by looking at document referrer or session storage
    const isFromNewsPage = 
      document.referrer.includes('/news') || 
      sessionStorage.getItem('fromNewsPage') === 'true';

    // Check if header animation has already been played in this session
    const hasPlayedHeaderAnimation = sessionStorage.getItem('headerAnimationPlayed') === 'true';

    if (isFromNewsPage || hasPlayedHeaderAnimation) {
      setSkipAnimation(true);
      setShowClientCards(true);
      // Don't start ClientCards animation here - let scroll detection handle it
      // Clear the session storage flag for news page
      if (isFromNewsPage) {
        sessionStorage.removeItem('fromNewsPage');
      }
    } else {
      // Delay showing client cards to allow header animation to complete
      // Header animation takes about 6 seconds total (intro + fade out + final header fade in)
      const timer = setTimeout(() => {
        setShowClientCards(true);
        // Don't start ClientCards animation here - let scroll detection handle it
      }, 7000); // 7 seconds to ensure header is fully complete

      return () => clearTimeout(timer);
    }
  }, []);

  // GSAP animation effect for navbar show/hide
  useEffect(() => {
    console.log('GSAP effect triggered, showNavbar:', showNavbar, 'navbarRef.current:', !!navbarRef.current);
    
    if (!navbarRef.current) {
      console.log('No navbar ref available');
      return;
    }

    const element = navbarRef.current;

    if (showNavbar) {
      console.log('Showing navbar with GSAP');
      
      // Start ClientCards animation when navbar starts to show
      setStartClientCardsAnimation(true);
      
      // Kill any existing animations
      gsap.killTweensOf(element);
      
      // Make visible and set initial position
      element.style.display = 'flex';
      
      // Use fromTo for more reliable animation
      gsap.fromTo(element, 
        {
          opacity: 0,
          y: -20
        },
        {
          opacity: 1,
          y: 0,
          duration: skipAnimation ? 0.1 : 1.4, // Slower transition-in
          delay: skipAnimation ? 0 : 1.0, // 1 second delay for scroll trigger
          ease: "power2.out",
          onComplete: () => console.log('Show animation complete')
        }
      );
    } else {
      console.log('Hiding navbar with GSAP');
      
      // Kill any existing animations
      gsap.killTweensOf(element);
      
      // Animate out
      gsap.to(element, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          element.style.display = 'none';
          console.log('Hide animation complete');
        }
      });
    }
  }, [showNavbar, skipAnimation]);

  // const handleClientCardsBottomReached = (reached: boolean) => {
  //   console.log('Client cards reached:', reached);
  //   setShowNavbar(reached);
  // };

  return (
    <div 
      className="min-h-screen font-body flex flex-col relative"
      style={{
        backgroundColor: '#f8f9fa',
        backgroundImage: `
          linear-gradient(to right, #f0f1f2 1px, transparent 1px),
          linear-gradient(to bottom, #f0f1f2 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px'
      }}
    >
      {/* Header Section */}
      <Header ref={navbarRef} skipAnimation={skipAnimation} showNavbar={showNavbar} />

      {/* Hero Section */}
      {/* <Hero onClientCardsBottomReached={handleClientCardsBottomReached} /> */}

      {/* Client Cards Section - Only render after header animation completes or immediately if skipping */}
      {showClientCards && (
        <main id="client-cards" className="flex flex-1 flex-col items-center justify-start px-2 sm:px-4">
          <ClientCards startAnimation={startClientCardsAnimation} />
        </main>
      )}
    </div>
  );
} 