import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { SITE_CONFIG } from "@/config/site";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#2D5A46",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://play-pet-adoption.vercel.app"
  ),
  title: `${SITE_CONFIG.brandName} — ${SITE_CONFIG.brandTagline}`,
  description: SITE_CONFIG.description,
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐾</text></svg>",
  },
  openGraph: {
    type: "website",
    title: `${SITE_CONFIG.brandName} — ${SITE_CONFIG.brandTagline}`,
    description: SITE_CONFIG.description,
    images: ["/images/7.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.brandName} — ${SITE_CONFIG.brandTagline}`,
    description: SITE_CONFIG.description,
    images: ["/images/7.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
