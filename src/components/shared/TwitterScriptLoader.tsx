"use client";

import Script from "next/script";

export default function TwitterScriptLoader() {
  return (
    <Script
      src="https://platform.twitter.com/widgets.js"
      strategy="lazyOnload"
      onLoad={() => {
        if (typeof window !== 'undefined') {
          (window as Window & { twttrLoaded?: boolean }).twttrLoaded = true;
          window.dispatchEvent(new Event('twttrLoaded'));
        }
      }}
    />
  );
}