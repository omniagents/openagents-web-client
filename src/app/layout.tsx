import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OpenAgentsProvider } from "@/contexts/OpenAgentsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenAgents Web Client",
  description: "A web client for the OpenAgents network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
      <script src="https://cdn.tailwindcss.com/"></script>
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen`}>
        <OpenAgentsProvider>
          {children}
        </OpenAgentsProvider>
      </body>
    </html>
  );
} 