import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ALTER COLUMN "cover_title" SET DEFAULT 'You''re Invited!';
  ALTER TABLE "payload"."details" ALTER COLUMN "gallery_title" SET DEFAULT 'Gallery';
  ALTER TABLE "payload"."details" ALTER COLUMN "gallery_intro" SET DEFAULT 'A few of our favourite memories together.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ALTER COLUMN "cover_title" SET DEFAULT 'You''re invited';
  ALTER TABLE "payload"."details" ALTER COLUMN "gallery_title" SET DEFAULT 'Moments';
  ALTER TABLE "payload"."details" ALTER COLUMN "gallery_intro" SET DEFAULT 'A few of our favourite memories so far.';`)
}
