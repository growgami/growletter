"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import TweetBoard from "@/components/tweet-board/tabs/collections/tweets/TweetBoard";
import AuthorTable from "@/components/tweet-board/tabs/people/PeopleTable";
import Navbar from "@/components/tweet-board/Navbar";

export default function PageContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams?.get('client');
  const [activeTab, setActiveTab] = useState<"Social Board" | "People">("Social Board");

  const handleTabChange = (tab: "Social Board" | "People") => {
    setActiveTab(tab);
  };

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
            <AuthorTable />
          )}
        </section>
      </main>
    </div>
  );
}
