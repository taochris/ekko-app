import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.81", "cb4fbc2ca64e2d.lhr.life"],
  reactStrictMode: false,
  // Forcer l'inclusion du binaire ffmpeg-static dans le bundle serverless Vercel
  // (sans ça, Next.js peut l'exclure via le tracing des dépendances et le spawn échoue avec ENOENT)
  outputFileTracingIncludes: {
    "/api/capsules/[id]/process": ["./node_modules/@ffmpeg-installer/**"],
  },
};

export default nextConfig;
