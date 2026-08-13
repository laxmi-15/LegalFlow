import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Route — AI Client Intake for Modern Law Firms",
  description:
    "Every legal inquiry reaches the right attorney. Route is the AI agent that intakes, qualifies, and routes client inquiries automatically — from first message to booked consultation.",
  keywords: [
    "law firm intake software",
    "AI client intake",
    "legal lead routing",
    "attorney matching AI",
  ],
  openGraph: {
    title: "Route — AI Client Intake for Modern Law Firms",
    description:
      "AI-powered client intake, qualification and intelligent routing for modern law firms.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-background font-sans">{children}</body>
    </html>
  );
}
