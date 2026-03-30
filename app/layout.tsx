import type { Metadata } from "next";
import { Cormorant_Garamond, Cormorant } from "next/font/google";
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
