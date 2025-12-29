import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase API route timeout for PDF processing
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Externalize canvas and pdfjs-dist for server builds
  // These are only used client-side, so we don't need them in server bundle
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize canvas and pdfjs-dist for server-side builds
      config.externals = config.externals || [];
      config.externals.push({
        canvas: "commonjs canvas",
        "pdfjs-dist": "commonjs pdfjs-dist",
      });
    }
    return config;
  },
};

export default nextConfig;
