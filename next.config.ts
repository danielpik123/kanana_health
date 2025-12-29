import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase API route timeout for PDF processing
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Use webpack configuration to handle server-only packages
  webpack: (config, { isServer, webpack }) => {
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
      // For client builds, completely ignore firebase-admin and related packages
      // These are server-only and should never be bundled for client
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^firebase-admin$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^firebase-admin\/.*/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^@google-cloud\/.*/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^google-auth-library$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^google-auth-library\/.*/,
        })
      );

      // Also externalize as fallback
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push(
          "firebase-admin",
          /^firebase-admin\/.*/,
          /^@google-cloud\/.*/,
          /^google-auth-library\/.*/
        );
      } else {
        config.externals = [
          config.externals,
          "firebase-admin",
          /^firebase-admin\/.*/,
          /^@google-cloud\/.*/,
          /^google-auth-library\/.*/,
        ];
      }
    }
    return config;
  },
};

export default nextConfig;
