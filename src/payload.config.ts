import { postgresAdapter } from "@payloadcms/db-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { migrations } from "./migrations";
import { Media } from "./payload/collections/Media";
import { Users } from "./payload/collections/Users";
import { PageText } from "./payload/globals/PageText";
import { Seo } from "./payload/globals/Seo";
import { Wedding } from "./payload/globals/Wedding";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  // /admin is the Supabase-backed guest admin, so the CMS lives at /cms
  routes: { admin: "/cms" },
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " · Wedding CMS" },
  },
  collections: [Users, Media],
  globals: [Wedding, PageText, Seo],
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
    // Keep CMS tables out of `public`, which Supabase exposes through its Data API
    schemaName: "payload",
    // Schema changes always go through migrations (npm run payload migrate:create), even in dev
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
    // Apply pending migrations when the deployed app starts, so deploys need no manual DB step
    prodMigrations: migrations,
  }),
  sharp,
  plugins: [
    // Vercel's filesystem is read-only, so uploads go to Vercel Blob. Without a token (local dev)
    // files are stored on disk; alwaysInsertFields keeps the DB schema the same either way.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      alwaysInsertFields: true,
      // Serve images straight from Blob (public URLs work in link previews without hitting the app)
      collections: { media: { disablePayloadAccessControl: true } },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Upload straight from the browser; Vercel limits server request bodies to 4.5 MB
      clientUploads: true,
      // Blob files are cached for a year, so give every upload a unique name; a replaced photo
      // with the same filename would otherwise keep showing the old one
      addRandomSuffix: true,
    }),
  ],
});
