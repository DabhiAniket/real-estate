import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { SITE_URL } from "@/lib/site";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#222522",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Real Estate | Architectural Luxury Residences & Land",
    template: "%s | Real Estate Atelier",
  },
  description:
    "Curators of architectural permanence. Explore cantilevered concrete villas, Grade-A commercial flagships, and strategic development land acreage.",
  keywords: [
    "Luxury Real Estate",
    "Architectural Luxury Residences",
    "Modern Luxury Villa",
    "Duplex Penthouses",
    "Grade-A Commercial",
    "Coastal Development Land",
    "Architectural 3D Scroll",
  ],
  authors: [{ name: "Studio Architecture & Partner Architects" }],
  creator: "Real Estate Atelier",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Real Estate Atelier",
    title: "Spaces That Shape a Better Tomorrow | Real Estate",
    description:
      "Curators of architectural permanence. Explore cantilevered concrete villas, Grade-A commercial flagships, and strategic development land.",
    images: [
      {
        url: "/images/reference/villa-exterior-pool.jpg",
        width: 2560,
        height: 1920,
        alt: "Modern villa with white render, timber cladding and an infinity pool",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} h-full bg-charcoal antialiased`}
    >
      <body className="min-h-full flex flex-col bg-charcoal text-linen selection:bg-copper/30 selection:text-linen">
        <SmoothScroll>
          <Navigation />
          <div className="flex-grow">{children}</div>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
