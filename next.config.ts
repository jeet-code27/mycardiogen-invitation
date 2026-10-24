import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page here is per-request (per-doctor invitation, admin session),
  // so the classic dynamic rendering model is used instead of Cache Components.
  cacheComponents: false,
  // Fonts and the heart render used by the social preview images.
  outputFileTracingIncludes: {
    "/*": ["./assets/**/*", "./public/brand/logo-light.svg"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        // Personal invitations and the admin console should never be indexed.
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
