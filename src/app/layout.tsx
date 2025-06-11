import type { Metadata } from "next";
import TwitterScriptLoader from "@/components/shared/TwitterScriptLoader";
import QueryProvider from "@/components/shared/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Growletter",
  description: "Social Board by Growgami",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Playfair+Display:ital@1&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
        {/* Twitter widgets script for embeds - using client component */}
        <TwitterScriptLoader />
      </body>
    </html>
  );
}
