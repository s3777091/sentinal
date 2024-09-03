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
              <div className="loading_dog_main">
                <div className="dog">
                  <div className="dog__paws">
                    <div className="dog__bl-leg leg">
                      <div className="dog__bl-paw paw"></div>
                      <div className="dog__bl-loading_dog_top loading_dog_top"></div>
                    </div>
                    <div className="dog__fl-leg leg">
                      <div className="dog__fl-paw paw"></div>
                      <div className="dog__fl-loading_dog_top loading_dog_top"></div>
                    </div>
                    <div className="dog__fr-leg leg">
                      <div className="dog__fr-paw paw"></div>
                      <div className="dog__fr-loading_dog_top loading_dog_top"></div>
                    </div>
                  </div>

                  <div className="dog__body">
                    <div className="dog__tail"></div>
                  </div>

                  <div className="dog__head">
                    <div className="dog__snout">
                      <div className="dog__nose"></div>
                      <div className="dog__eyes">
                        <div className="dog__eye-l"></div>
                        <div className="dog__eye-r"></div>
                      </div>
                    </div>
                  </div>

                  <div className="dog__head-c">
                    <div className="dog__ear-l"></div>
                    <div className="dog__ear-r"></div>
                  </div>
                </div>
              </div>
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
