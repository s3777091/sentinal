import React from "react";
import type { Metadata } from "next";
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/shared/App/theme-provider";
import { neobrutalism } from "@clerk/themes";
import "../globals.css"; // Ensure your fonts are loaded in globals.css
import LeftSidebar from "@/components/shared/App/LeftSidebar";
import Bottombar from "@/components/shared/App/Bottombar";
import Topbar from "@/components/shared/App/Topbar";
import DogLoad from "@/components/Loading/DogLoad";
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Skira",
  description: "A Next.js 14 Skira application",
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#3371FF",
          fontSize: "16px",
        },
        baseTheme: neobrutalism,
      }}
    >
      <html lang="en">
        <body className={`${inter.variable} font-sans`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClerkLoading>
              <DogLoad />
            </ClerkLoading>
            <ClerkLoaded>
              <Topbar />
              <main className="flex flex-row">
                <LeftSidebar />
                <section className="main-container">
                  <div className="w-full">{children}</div>
                </section>
              </main>
              <Toaster />
              <Bottombar />
            </ClerkLoaded>
          </ThemeProvider>
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}