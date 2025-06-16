"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TweetBoard from "@/components/tweet-board/tabs/collections/tweets/TweetBoard";
import AuthorTable from "@/components/tweet-board/tabs/people/PeopleTable";
import Navbar from "@/components/tweet-board/Navbar";
import TgNewsletter from "@/components/modals/TgNewsletter";
import { getTelegramLinkByClientId } from "@/constants/telegramLinks";

export default function PageContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('client');
  const [activeTab, setActiveTab] = useState<"Social Board" | "People">("Social Board");
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  const handleTabChange = (tab: "Social Board" | "People") => {
    setActiveTab(tab);
  };

  const handleCloseNewsletterModal = () => {
    setShowNewsletterModal(false);
    // Mark as shown for this session to avoid repeated popups
    if (clientId) {
      sessionStorage.setItem(`newsletterShown_${clientId}`, 'true');
    }
  };

  // Effect to show newsletter modal for clients with telegram links
  useEffect(() => {
    if (clientId) {
      const clientIdNum = parseInt(clientId, 10);
      const telegramLink = getTelegramLinkByClientId(clientIdNum);
      const hasShownThisSession = sessionStorage.getItem(`newsletterShown_${clientId}`) === 'true';
      
      // Show modal if client has telegram link and hasn't been shown this session
      if (telegramLink && !hasShownThisSession) {
        // Small delay to let the page load first
        const timer = setTimeout(() => {
          setShowNewsletterModal(true);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [clientId]);

  return (
    <div 
      className="min-h-screen bg-gray-50 font-body"
      style={{
        backgroundColor: '#f8f9fa',
        backgroundImage: `
          linear-gradient(to right, #f0f1f2 1px, transparent 1px),
          linear-gradient(to bottom, #f0f1f2 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px'
      }}
    >
      {/* Navbar with tabs */}
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content Section */}
      <main className="pt-16 sm:pt-18 md:pt-20">
        {/* Page Title */}

        {/* Content Section */}
        <section className="py-2">
          {activeTab === "Social Board" ? (
            <TweetBoard clientId={clientId} />
          ) : (
            <AuthorTable clientId={clientId} />
          )}
        </section>
      </main>

      {/* Newsletter Modal */}
      {clientId && (
        <TgNewsletter
          isOpen={showNewsletterModal}
          onClose={handleCloseNewsletterModal}
          clientId={parseInt(clientId, 10)}
        />
      )}
    </div>
  );
}
