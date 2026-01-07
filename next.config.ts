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
};

export default nextConfig;

