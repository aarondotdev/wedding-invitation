import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."details" ALTER COLUMN "gallery_intro" SET DEFAULT 'A few of our favorite memories together.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."details" ALTER COLUMN "gallery_intro" SET DEFAULT 'A few of our favourite memories together.';`)
}
