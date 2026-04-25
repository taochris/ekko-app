"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

export default function AnalyticsWrapper() {
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ekko-cookie-consent") as "accepted" | "rejected" | null;
    setConsent(stored);
  }, []);

  if (consent !== "accepted") return null;

  return (
    <>
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
      <Analytics />
    </>
  );
}
