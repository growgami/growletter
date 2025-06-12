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
