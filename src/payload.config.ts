import { postgresAdapter } from "@payloadcms/db-postgres";
import path from "path";
import { buildConfig, type Plugin } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { migrations } from "./migrations";
import { Media } from "./payload/collections/Media";
import { Users } from "./payload/collections/Users";
import { Wishes } from "./payload/collections/Wishes";
import { Details } from "./payload/globals/Details";
import { Entourage } from "./payload/globals/Entourage";
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
  collections: [Users, Media, Wishes],
  globals: [Wedding, PageText, Entourage, Details, Seo],
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
  // The blob storage plugin is only loaded in production (when the token exists).
  // Importing it at all in dev causes Turbopack to pull its client upload handler
  // into the site pages' RSC bundle, triggering a "module factory not available" error.
  // In dev, uploads go to the local filesystem instead.
  plugins: await (async (): Promise<Plugin[]> => {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return [];
    // String concatenation hides the specifier from Turbopack's static analysis
    const pkg = "@payloadcms/" + "storage-vercel-blob";
    const { vercelBlobStorage } = await import(/* webpackIgnore: true */ pkg);
    return [vercelBlobStorage({
      enabled: true,
      alwaysInsertFields: true,
      collections: { media: { disablePayloadAccessControl: true } },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: false,
      addRandomSuffix: true,
    })];
  })(),
});
