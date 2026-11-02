import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ALTER COLUMN "hero_intro" SET DEFAULT 'our very special guest';
  ALTER TABLE "payload"."page_text" ALTER COLUMN "story_text" SET DEFAULT 'You didn''t receive this invitation by chance. On this special day, we truly hope you''ll be with us.';
  ALTER TABLE "payload"."entourage" ALTER COLUMN "title" SET DEFAULT 'THE ENTOURAGE';
  ALTER TABLE "payload"."page_text" ADD COLUMN "custom_section_title" varchar DEFAULT '';
  ALTER TABLE "payload"."page_text" ADD COLUMN "custom_section_body" varchar DEFAULT '';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ALTER COLUMN "hero_intro" SET DEFAULT 'Together with their families';
  ALTER TABLE "payload"."page_text" ALTER COLUMN "story_text" SET DEFAULT 'Every love story is beautiful, but ours is our favourite. After years of laughter, adventures and quiet moments together, we''re ready to begin our next chapter, and we would love for you to be there.';
  ALTER TABLE "payload"."entourage" ALTER COLUMN "title" SET DEFAULT 'Family & Entourage';
  ALTER TABLE "payload"."page_text" DROP COLUMN "custom_section_title";
  ALTER TABLE "payload"."page_text" DROP COLUMN "custom_section_body";`)
}
