"use client";
import Link from "next/link";

interface EkkoLogoProps {
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export default function EkkoLogo({ size = "md" }: EkkoLogoProps) {
  const heights = {
    sm: 95,
    md: 135,
    lg: 160,
  };

  return (
    <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/vosekko-logo.png"
        alt="VOSEKKO"
        style={{
          height: heights[size],
          width: "auto",
          objectFit: "contain",
          mixBlendMode: "screen",
          opacity: 0.92,
        }}
      />
    </Link>
  );
}
