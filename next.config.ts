import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Guest list uploads are capped at 2 MB in the import action; leave room for multipart overhead
    serverActions: { bodySizeLimit: "3mb" },
  },
  headers() {
    return [
      {
        // Keep personal invite codes out of the Referer sent to maps and other links
        source: "/i/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
