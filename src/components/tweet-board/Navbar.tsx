"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { getClientById } from "@/components/clients/client-list/clients";

interface NavbarProps {
  activeTab?: "Social Board" | "People";
  onTabChange?: (tab: "Social Board" | "People") => void;
}

export default function Navbar({ activeTab = "Social Board", onTabChange }: NavbarProps) {
  const [currentTab, setCurrentTab] = useState<"Social Board" | "People">(activeTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams?.get('client');
  
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
            <motion.button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
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

                  {/* Navigation Tabs */}
                  <div className="space-y-2">
                    <motion.button
                      className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-colors font-body ${
                        currentTab === "Social Board"
                          ? "bg-gray-900 text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => handleTabClick("Social Board")}
                      whileTap={{ scale: 0.98 }}
                    >
                      Social Board
                    </motion.button>

                    <motion.button
                      className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-colors font-body ${
                        currentTab === "People"
                          ? "bg-gray-900 text-white"
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