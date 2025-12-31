import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/truyen/:slug/chuong-:chapterNumber",
        destination: "/truyen/:slug/:chapterNumber",
      },
    ];
  },
};

export default nextConfig;
