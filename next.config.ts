import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow larger Server Action request bodies (needed for image uploads via FormData)
  // Increase this value if you plan to allow bigger images. Keep it reasonably small for safety.
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb', // Mở rộng giới hạn cho Server Actions
    },
  },
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
