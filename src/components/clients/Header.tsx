"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

// Register SplitText plugin
gsap.registerPlugin(SplitText);

interface HeaderProps {
  skipAnimation?: boolean;
}

export default function Header({ skipAnimation = false }: HeaderProps) {
  // Check if animation has already been played in this session
  const hasPlayedAnimation = typeof window !== 'undefined' && sessionStorage.getItem('headerAnimationPlayed') === 'true';
  const shouldSkipAnimation = skipAnimation || hasPlayedAnimation;
  
  const [animationComplete, setAnimationComplete] = useState(shouldSkipAnimation);
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const welcomeLineRef = useRef<HTMLHeadingElement>(null);
  const growgamiTextRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const finalHeaderRef = useRef<HTMLDivElement>(null);

  // Set animation complete immediately if skipping
  useEffect(() => {
    if (shouldSkipAnimation) {
      setAnimationComplete(true);
    }
  }, [shouldSkipAnimation]);

  // Intro animation effect
  useEffect(() => {
    if (animationComplete || shouldSkipAnimation) return; // Don't run animation if already complete or skipping
    
    if (!headerRef.current || !containerRef.current || !welcomeLineRef.current || !growgamiTextRef.current || !subtitleRef.current) return;

    // Create timeline
    const tl = gsap.timeline();

    // Split text for typewriter effect on Growgami only
    const growgamiSplit = new SplitText(growgamiTextRef.current, { type: "chars" });

    // Set initial states - header starts fullscreen and centered
    gsap.set(headerRef.current, { 
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      height: "100vh",
      backgroundColor: "rgba(249, 250, 251, 1)" // Match gray-50 background
    });
    gsap.set(containerRef.current, { 
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      paddingLeft: "2rem"
    });
    gsap.set(welcomeLineRef.current, { y: 50, opacity: 0 });
    gsap.set(growgamiTextRef.current, { visibility: "visible" }); // Make container visible
    gsap.set(growgamiSplit.chars, { opacity: 0 });
    gsap.set(subtitleRef.current, { y: 30, opacity: 0 });

    // Animation sequence
    tl
      // Animate "Welcome to Our" line slide up
      .to(welcomeLineRef.current, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out"
      })
      // Typewriter effect for "Growgami" - slower
      .to(growgamiSplit.chars, {
        opacity: 1,
        duration: 0.1,
        stagger: 0.15, // Slower typewriter effect
        ease: "none"
      }, "+=0.3")
      // Slide up the subtitle line
      .to(subtitleRef.current, {
        y: 0,
        opacity: 1,
        duration: 1.0,
        ease: "power2.out"
      }, "+=0.5")
      // Fade out the entire header
      .to(headerRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          // Mark animation as played in session storage
          sessionStorage.setItem('headerAnimationPlayed', 'true');
          setAnimationComplete(true);
        }
      }, "+=1.0");

    // Cleanup function
    return () => {
      growgamiSplit.revert();
    };
  }, [animationComplete, shouldSkipAnimation]);

  // Final header fade-in animation effect
  useEffect(() => {
    if (!animationComplete || !finalHeaderRef.current) return;

    // Set initial state for final header
    gsap.set(finalHeaderRef.current, { opacity: 0, y: 20 });

    // Animate final header fade in
    gsap.to(finalHeaderRef.current, {
      opacity: 1,
      y: 0,
      duration: shouldSkipAnimation ? 0 : 1.0, // No animation if skipping
      ease: "power2.out",
      delay: shouldSkipAnimation ? 0 : 0.2 // No delay if skipping
    });
  }, [animationComplete, shouldSkipAnimation]);

  // Show intro animation only if not skipping
  if (!animationComplete && !shouldSkipAnimation) {
    return (
      <section 
        className="fixed inset-0 z-[1000] h-screen bg-[#f8f8f8] backdrop-blur-sm border-b border-white/20" 
        ref={headerRef}
      >
        <div 
          className="flex items-center justify-start h-screen pl-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          ref={containerRef}
        >
          <div className="text-left">
            <h1 className="text-5xl font-light tracking-wide text-gray-800 sm:text-6xl lg:text-7xl">
              <span ref={welcomeLineRef} className="font-body opacity-0 translate-y-12">Welcome to the </span>
              <span 
                ref={growgamiTextRef}
                className="font-heading font-bold invisible"
              >
                Growletter
              </span>
            </h1>
            <p ref={subtitleRef} className="mt-4 text-2xl font-light text-gray-600 lg:text-2xl opacity-0 translate-y-8">
               <span className="font-heading font-bold text-gray-900 text-2xl tracking-wide">Growgami</span> <span className="font-body">Web3 Social Intelligence</span>
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Show final minimal sticky header state with divider
  return (
    <header ref={finalHeaderRef} className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200 shadow-sm flex justify-center py-6">
      <div className="flex items-baseline gap-3">
        <span className="font-heading text-2xl text-gray-900 font-bold select-none">Growletter</span>
        <span className="text-gray-400 text-sm tracking-wide select-none">by Growgami</span>
      </div>
    </header>
  );
}
