import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.81", "cb4fbc2ca64e2d.lhr.life"],
  reactStrictMode: false,
};

export default nextConfig;
