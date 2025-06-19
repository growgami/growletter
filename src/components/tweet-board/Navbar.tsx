"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { getClientById } from "@/constants/client-list/clients";
import { getTelegramLinkByClientId } from "@/constants/telegramLinks";

interface NavbarProps {
  activeTab?: "Social Board" | "People";
  onTabChange?: (tab: "Social Board" | "People") => void;
}

export default function Navbar({ activeTab = "Social Board", onTabChange }: NavbarProps) {
  const [currentTab, setCurrentTab] = useState<"Social Board" | "People">(activeTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('client');
  
  // Ensure hydration is complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Sync local state with prop changes
  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);
  
  // Get client base name or fallback to Growletter
  const getClientBaseName = () => {
    if (!clientId) return "Growletter";
    
    const clientIdNum = parseInt(clientId, 10);
    const client = getClientById(clientIdNum);
    return client ? client.title : "Growletter";
  };

  const clientBaseName = getClientBaseName();
  const ecosystemName = `${clientBaseName} ${currentTab === "People" ? "People" : "Wall"}`;

  const handleTabClick = (tab: "Social Board" | "People") => {
    setCurrentTab(tab);
    onTabChange?.(tab);
    setMobileMenuOpen(false); // Close mobile menu after selection
  };

  const handleClientsClick = () => {
    // Set flag to indicate user is coming from news page
    sessionStorage.setItem('fromNewsPage', 'true');
    router.push('/home');
    setMobileMenuOpen(false); // Close mobile menu
  };

  const handleTelegramClick = () => {
    if (!clientId) return;
    
    const clientIdNum = parseInt(clientId, 10);
    const telegramLink = getTelegramLinkByClientId(clientIdNum);
    
    if (telegramLink) {
      window.open(telegramLink.url, '_blank');
    }
    setMobileMenuOpen(false); // Close mobile menu
  };

  // Get telegram link for current client
  const getTelegramLink = () => {
    if (!clientId) return null;
    
    const clientIdNum = parseInt(clientId, 10);
    return getTelegramLinkByClientId(clientIdNum);
  };

  const telegramLink = getTelegramLink();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-50/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="font-heading text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{ecosystemName}</h1>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                key={`walls-button-${currentTab}`}
                className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-500 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors font-body min-h-[44px]"
                onClick={handleClientsClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Wall
              </motion.button>

              {/* Telegram Button - Only show if telegram link exists */}
              {telegramLink && (
                <motion.button
                  className="px-4 py-2 bg-blue-500/90 backdrop-blur-sm border border-blue-600 text-sm font-medium text-white hover:bg-blue-600 transition-colors font-body min-h-[44px] flex items-center space-x-2"
                  onClick={handleTelegramClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L7.026 13.15l-2.91-.918c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                  <span>Newsletter</span>
                </motion.button>
              )}

              {/* Navigation Tabs - Desktop */}
              <nav className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm p-1 border border-gray-500">
                <motion.button
                  className={`px-6 py-2 text-sm font-medium transition-colors relative font-body min-h-[44px] ${
                    currentTab === "Social Board"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => handleTabClick("Social Board")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {currentTab === "Social Board" && (
                    <motion.div
                      className="absolute inset-0 bg-white/80 backdrop-blur-sm border border-gray-600"
                      layoutId="activeTab"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                  <span className="relative z-10">Social Board</span>
                </motion.button>

                <motion.button
                  className={`px-6 py-2 text-sm font-medium transition-colors relative font-body min-h-[44px] ${
                    currentTab === "People"
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => handleTabClick("People")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {currentTab === "People" && (
                    <motion.div
                      className="absolute inset-0 bg-white/80 backdrop-blur-sm border border-gray-600"
                      layoutId="activeTab"
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  )}
                  <span className="relative z-10">People</span>
                </motion.button>
              </nav>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden">
              {isHydrated ? (
                <motion.button
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-col space-y-1">
                    <motion.div
                      className="w-5 h-0.5 bg-gray-600"
                      animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.div
                      className="w-5 h-0.5 bg-gray-600"
                      animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.div
                      className="w-5 h-0.5 bg-gray-600"
                      animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </motion.button>
              ) : (
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200">
                  <div className="flex flex-col space-y-1">
                    <div className="w-5 h-0.5 bg-gray-600" />
                    <div className="w-5 h-0.5 bg-gray-600" />
                    <div className="w-5 h-0.5 bg-gray-600" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <motion.div
              className="fixed top-[73px] left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg z-40 md:hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="space-y-4">
                  {/* Clients Button */}
                  <motion.button
                    key={`mobile-walls-button-${currentTab}`}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl text-left font-medium text-gray-700 hover:bg-gray-100 transition-colors font-body"
                    onClick={handleClientsClick}
                    whileTap={{ scale: 0.98 }}
                  >
                    Wall
                  </motion.button>

                  {/* Telegram Button - Mobile */}
                  {telegramLink && (
                    <motion.button
                      className="w-full px-4 py-3 bg-blue-500 rounded-xl text-left font-medium text-white hover:bg-blue-600 transition-colors font-body flex items-center space-x-2"
                      onClick={handleTelegramClick}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L7.026 13.15l-2.91-.918c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                      </svg>
                      <span>Newsletter</span>
                    </motion.button>
                  )}

                  {/* Navigation Tabs */}
                  <div className="space-y-2">
                    <motion.button
                      className={`w-full px-4 py-3 rounded-md text-left font-medium transition-colors font-body relative ${
                        currentTab === "Social Board"
                          ? "bg-white/80 backdrop-blur-sm border border-gray-600 text-gray-900"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => handleTabClick("Social Board")}
                      whileTap={{ scale: 0.98 }}
                    >
                      Social Board
                    </motion.button>

                    <motion.button
                      className={`w-full px-4 py-3 rounded-md text-left font-medium transition-colors font-body relative ${
                        currentTab === "People"
                          ? "bg-white/80 backdrop-blur-sm border border-gray-600 text-gray-900"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => handleTabClick("People")}
                      whileTap={{ scale: 0.98 }}
                    >
                      People
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 