import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { dark, neobrutalism } from "@clerk/themes";
import "../globals.css";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Bottombar from "@/components/shared/Bottombar";
import Topbar from "@/components/shared/Topbar";
import DogLoad from "@/components/LoadiComponents/DogLoad";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skira",
  description: "A Next.js 14 Skira application",
};

// appearance={{
//   baseTheme: dark,
//   signIn: { baseTheme: neobrutalism },
// }}

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
        <body className={inter.className}>
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
              <Bottombar />
            </ClerkLoaded>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
