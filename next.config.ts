import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.diggy.menu",
      },
    ],
  },
};

export default nextConfig;
