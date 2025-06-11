import React from "react";
import Image from "next/image";
import { useContributorsQuery } from "@/hooks/query/useContributorsQuery";
import "../styles/marquee.css";

export default function ContributorMarquee() {
  const { data: contributors, isLoading } = useContributorsQuery();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-4 text-gray-500">Loading contributors...</div>
    );
  }

  if (!contributors || contributors.length === 0) {
    return null;
  }

  // Duplicate the list for infinite effect
  const marqueeContributors = [...contributors, ...contributors];

  return (
    <div className="group overflow-x-hidden w-full bg-gray-50 py-6 border-b-4 border-gray-200">
      <div className="relative w-full">
        <div
          className="flex gap-4 whitespace-nowrap marquee-row"
        >
          {marqueeContributors.map((contributor, idx) => (
            <div
              key={contributor.id + '-' + idx}
              className="contributor-card relative flex flex-col items-center justify-center bg-white rounded-xl shadow px-6 py-4 min-w-[340px] max-w-xs border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Blurred background image using Next.js Image */}
              <div className="absolute inset-0 w-full h-full z-0">
                <Image
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=003366&color=fff&size=256&format=png`}
                  alt="profile background"
                  fill
                  className="object-cover blur-lg scale-110 opacity-60"
                  draggable={false}
                  aria-hidden="true"
                  priority={idx < 5}
                />
                <div className="absolute inset-0 bg-white/300" />
              </div>
              {/* Card content */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-3xl font-bold text-blue-600 border-4 border-white shadow-lg">
                  {contributor.name.charAt(0)}
                </div>
                <div className="flex flex-col items-center">
                  <div className="font-semibold text-gray-800 text-lg mb-1">{contributor.name}</div>
                  <div className="text-gray text-base">{contributor.handle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
