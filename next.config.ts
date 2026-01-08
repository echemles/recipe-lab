import type { NextConfig } from "next";

const PLAYWRIGHT_PORT = process.env.PLAYWRIGHT_TEST_PORT ?? "3100";

const allowedDevOrigins = [
  "127.0.0.1",
  "localhost",
];

type NextConfigWithAllowedDevOrigins = NextConfig & {
  allowedDevOrigins?: string[];
};

const nextConfig: NextConfigWithAllowedDevOrigins = {
  allowedDevOrigins,
  // Ensure server-only packages are not bundled into the client
  serverExternalPackages: ['unsplash-js'],
  // Allow Unsplash images in next/image
  images: {
    domains: ['images.unsplash.com'],
  },
};

export default nextConfig;

