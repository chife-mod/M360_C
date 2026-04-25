import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Market360_Signal_Selector",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/Market360_Signal_Selector",
  },
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
