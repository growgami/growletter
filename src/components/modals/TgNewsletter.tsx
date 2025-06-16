"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getTelegramLinkByClientId } from "@/constants/telegramLinks";
import { getClientById } from "@/constants/client-list/clients";

interface TgNewsletterProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
}

export default function TgNewsletter({ isOpen, onClose, clientId }: TgNewsletterProps) {
  const [telegramLink, setTelegramLink] = useState<ReturnType<typeof getTelegramLinkByClientId>>(undefined);
  const [client, setClient] = useState<ReturnType<typeof getClientById>>(undefined);

  useEffect(() => {
    if (isOpen && clientId) {
      const link = getTelegramLinkByClientId(clientId);
      const clientData = getClientById(clientId);
      setTelegramLink(link);
      setClient(clientData);
    }
  }, [isOpen, clientId]);

  // Don't render if no telegram link exists for this client
  if (!telegramLink || !client) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTelegramClick = () => {
    window.open(telegramLink.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-md border border-gray-500 shadow-lg max-w-md w-full mx-4"
              style={{
                boxShadow: '6px 6px 0px rgba(0, 0, 0, 0.25)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900">
                    {client.title} Newsletter
                  </h2>
                  <motion.button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <svg 
                      className="w-5 h-5 text-gray-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-gray-900 font-body">
                      Stay Updated with {telegramLink.title}
                    </h3>
                    <p className="text-gray-600 text-sm font-body">
                      Get the latest insights and updates directly from our Telegram newsletter.
                    </p>
                  </div>

                  {/* Telegram Button */}
                  <motion.button
                    onClick={handleTelegramClick}
                    className="w-full bg-white/60 backdrop-blur-sm border border-gray-500 px-6 py-3 text-gray-900 font-medium hover:bg-white/80 transition-all duration-300 font-body flex items-center justify-center space-x-3"
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
                    <svg 
                      className="w-5 h-5" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span>Join {telegramLink.title}</span>
                  </motion.button>

                  {/* Additional Info */}
                  <div className="bg-gray-50/60 backdrop-blur-sm border border-gray-300 p-4 text-left">
                    <p className="text-xs text-gray-600 font-body">
                      • Get scheduled market insights<br/>
                      • Exclusive analysis and updates<br/>
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50/40">
                <div className="flex justify-center space-x-3">
                  <motion.button
                    onClick={onClose}
                    className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-500 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors font-body"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Maybe Later
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
