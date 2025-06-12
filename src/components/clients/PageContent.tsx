"use client";

import { useState, useEffect } from "react";
import ClientCards from "@/components/clients/ClientCards";
import Header from "@/components/clients/Header";

export default function PageContent() {
  const [showClientCards, setShowClientCards] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);

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
      // Clear the session storage flag for news page
      if (isFromNewsPage) {
        sessionStorage.removeItem('fromNewsPage');
      }
    } else {
      // Delay showing client cards to allow header animation to complete
      // Header animation takes about 6 seconds total (intro + fade out + final header fade in)
      const timer = setTimeout(() => {
        setShowClientCards(true);
      }, 7000); // 7 seconds to ensure header is fully complete

      return () => clearTimeout(timer);
    }
  }, []);

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
      <Header skipAnimation={skipAnimation} />

      {/* Client Cards Section - Only render after header animation completes or immediately if skipping */}
      {showClientCards && (
        <main className="flex flex-1 flex-col items-center justify-start pt-12 sm:pt-16 md:pt-20 px-2 sm:px-4">
          <ClientCards />
        </main>
      )}
    </div>
  );
} 