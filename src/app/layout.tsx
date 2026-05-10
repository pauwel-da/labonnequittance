import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La Bonne Quittance",
  description: "Gérez vos quittances de loyer simplement",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#008020",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.className}>
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
        <Script src="https://scripts.simpleanalyticscdn.com/latest.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
