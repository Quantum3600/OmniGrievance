import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Initialize the standard Serwist wrapper
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

// Your standard Next.js configuration
const nextConfig: NextConfig = {
  // This explicitly silences the Next.js 16 Turbopack warning
  turbopack: {},
  reactStrictMode: true,
  output: 'standalone'
};

// Wrap and export the config
export default withSerwist(nextConfig);