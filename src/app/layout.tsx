import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La Bonne Quittance — Générez vos quittances de loyer gratuitement",
  description: "100% gratuit, sans abonnement. Vos quittances de loyer en PDF en 1 clic. Signature numérique et envoi par email inclus.",
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
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-18008672783" strategy="afterInteractive" />
        <Script id="google-ads-tag" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-18008672783');
        `}</Script>
        <Script src="https://scripts.simpleanalyticscdn.com/latest.js" strategy="afterInteractive" />
        <Script id="schema-website" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': 'La Bonne Quittance',
          'url': 'https://labonnequittance.fr',
        }) }} />
      </body>
    </html>
  );
}
