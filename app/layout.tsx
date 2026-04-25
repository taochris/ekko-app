import type { Metadata } from "next";
import { Cormorant_Garamond, Cormorant } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const cormorant = Cormorant({
  variable: "--font-cormorant-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "EKKO — Fusionnez vos souvenirs",
  description: "Transformez vos messages audio en souvenirs éternels. Vocapsules et livres de mémoire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${cormorantGaramond.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-screen w-full bg-[#0d0a0f] text-[#f0e8d8]">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HSCJ0SY2NK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HSCJ0SY2NK');
          `}
        </Script>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
