import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase API route timeout for PDF processing
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Use webpack configuration to handle pdfjs-dist
  // pdfjs-dist is only used client-side via dynamic import
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize canvas and pdfjs-dist for server builds
      // These packages are only needed client-side
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
