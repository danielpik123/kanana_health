import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase API route timeout for PDF processing
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Use webpack instead of Turbopack to avoid pdfjs-dist build issues
  // Turbopack has issues with pdfjs-dist's canvas dependency
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize canvas and pdfjs-dist for server builds
      // These are only used client-side via dynamic import
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("canvas", "pdfjs-dist");
      } else {
        config.externals = [
          config.externals,
          "canvas",
          "pdfjs-dist",
        ];
      }
    }
    return config;
  },
};

export default nextConfig;
