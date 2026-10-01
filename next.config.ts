import type { NextConfig } from "next";

const defaultBackend = process.env.VERCEL ? "https://smart-recycle-waste-classification.onrender.com" : "";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || defaultBackend;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
  async rewrites() {
    if (backendUrl) {
      return [
        {
          source: "/api/:path*",
          destination: `${backendUrl.replace(/\/$/, "")}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
