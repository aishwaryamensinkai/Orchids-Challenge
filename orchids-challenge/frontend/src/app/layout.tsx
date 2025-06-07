import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orchids AI Website Cloner",
  description:
    "Clone, analyze, and preview any website with AI. Instantly generate unique, styled, and accessible web clones using advanced LLMs. Compare originals, view design analysis, and more.",
  keywords: [
    "AI website cloner",
    "website clone",
    "web scraping",
    "OpenAI",
    "FastAPI",
    "Next.js",
    "React",
    "design analysis",
    "web preview",
    "accessibility",
    "SEO",
    "frontend",
    "backend",
    "Playwright",
    "LLM",
    "Orchids Challenge",
  ],
  authors: [
    {
      name: "Aishwarya",
      url: "https://aishwaryamensinkai.github.io/Portfolio/",
    },
  ],
  creator: "Orchids AI Team",
  openGraph: {
    title: "Orchids AI Website Cloner",
    description:
      "Clone, analyze, and preview any website with AI. Instantly generate unique, styled, and accessible web clones using advanced LLMs.",
    siteName: "Orchids AI Website Cloner",
    images: [
      {
        url: "https://ghanafact.com/storage/2020/12/art-work.jpg",
        width: 1200,
        height: 630,
        alt: "Orchids AI Website Cloner Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
