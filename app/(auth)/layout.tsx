import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "../globals.css";
import { dark, neobrutalism } from "@clerk/themes";

export const metadata = {
  title: "Skira",
  description: "A next.js 15 Meta CyberSentinal Application",
};

const inter = Inter({
  subsets: ["latin"],
});

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
        <body className={`${inter.className} bg-dark-1`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
