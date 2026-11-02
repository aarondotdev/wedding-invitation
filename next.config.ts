import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // CMS uploads are served from Vercel Blob
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
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
        condition: { not: "foreign" },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
    resolveAlias: {
      // Redirect the blob client handler to a stub so Turbopack doesn't pull the real
      // module (which has CSS and client component issues) into the RSC bundle.
      "@payloadcms/storage-vercel-blob/client": "./src/lib/blob-client-stub.js",
    },
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: true });
