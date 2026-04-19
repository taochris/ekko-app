import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.81", "cb4fbc2ca64e2d.lhr.life"],
  reactStrictMode: false,
  // Exclure @ffmpeg-installer du bundling pour éviter les require() dynamiques
  // (le module est chargé au runtime Node.js directement, pas via le bundle)
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg", "fluent-ffmpeg", "ffprobe-static"],
  outputFileTracingIncludes: {
    "/api/capsules/[id]/process": ["./node_modules/@ffmpeg-installer/**"],
  },
};

export default nextConfig;
