import { postgresAdapter } from "@payloadcms/db-postgres";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";

import { Users } from "./payload/collections/Users";
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
  collections: [Users],
  globals: [Wedding],
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
    // Keep CMS tables out of `public`, which Supabase exposes through its Data API
    schemaName: "payload",
    // Schema changes always go through migrations (npm run payload migrate:create), even in dev
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
  }),
  sharp,
});
