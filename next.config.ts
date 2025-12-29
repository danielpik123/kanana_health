import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase API route timeout for PDF processing
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Use webpack configuration to handle server-only packages
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
    } else {
      // For client builds, externalize firebase-admin (server-only package)
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("firebase-admin");
      } else {
        config.externals = [
          config.externals,
          "firebase-admin",
        ];
      }
    }
    return config;
  },
};

export default nextConfig;
