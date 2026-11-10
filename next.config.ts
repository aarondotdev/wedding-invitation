import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // CMS uploads are served from Vercel Blob
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    // Fewer widths means fewer resized copies to make, so more guests get one that's already cached.
    // 1920 is the largest: full-screen photos stay sharp on laptops without 3840px downloads.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // 90 for the gilded cover frame and envelope, where 75 shows banding
    qualities: [75, 90],
    // Keep resized copies for 31 days. CMS uploads get a new file name when replaced, so a long
    // cache never shows an outdated photo.
    minimumCacheTTL: 2678400,
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
