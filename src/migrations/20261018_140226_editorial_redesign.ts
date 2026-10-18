import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."wedding_events" ADD COLUMN "photo_id" integer;
  ALTER TABLE "payload"."page_text" ADD COLUMN "hero_photo_id" integer;
  ALTER TABLE "payload"."page_text" ADD COLUMN "nav_story" varchar DEFAULT 'Our story';
  ALTER TABLE "payload"."page_text" ADD COLUMN "nav_celebration" varchar DEFAULT 'Celebration';
  ALTER TABLE "payload"."page_text" ADD COLUMN "nav_schedule" varchar DEFAULT 'Schedule';
  ALTER TABLE "payload"."page_text" ADD COLUMN "nav_rsvp" varchar DEFAULT 'RSVP';
  ALTER TABLE "payload"."page_text" ADD COLUMN "story_title" varchar DEFAULT 'Two hearts under one moon';
  ALTER TABLE "payload"."page_text" ADD COLUMN "story_text" varchar DEFAULT 'Every love story is beautiful, but ours is our favourite. After years of laughter, adventures and quiet moments together, we''re ready to begin our next chapter, and we would love for you to be there.';
  ALTER TABLE "payload"."page_text" ADD COLUMN "story_photo_id" integer;
  ALTER TABLE "payload"."page_text" ADD COLUMN "statement_text" varchar DEFAULT 'We would be honoured to celebrate this day with you';
  ALTER TABLE "payload"."page_text" ADD COLUMN "statement_note" varchar DEFAULT 'Your presence is the greatest gift. Come as you are, and leave with memories we will share forever.';
  ALTER TABLE "payload"."page_text" ADD COLUMN "statement_photo_id" integer;
  ALTER TABLE "payload"."wedding_events" ADD CONSTRAINT "wedding_events_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."page_text" ADD CONSTRAINT "page_text_hero_photo_id_media_id_fk" FOREIGN KEY ("hero_photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."page_text" ADD CONSTRAINT "page_text_story_photo_id_media_id_fk" FOREIGN KEY ("story_photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."page_text" ADD CONSTRAINT "page_text_statement_photo_id_media_id_fk" FOREIGN KEY ("statement_photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "wedding_events_photo_idx" ON "payload"."wedding_events" USING btree ("photo_id");
  CREATE INDEX "page_text_hero_hero_photo_idx" ON "payload"."page_text" USING btree ("hero_photo_id");
  CREATE INDEX "page_text_story_story_photo_idx" ON "payload"."page_text" USING btree ("story_photo_id");
  CREATE INDEX "page_text_statement_statement_photo_idx" ON "payload"."page_text" USING btree ("statement_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."wedding_events" DROP CONSTRAINT "wedding_events_photo_id_media_id_fk";
  
  ALTER TABLE "payload"."page_text" DROP CONSTRAINT "page_text_hero_photo_id_media_id_fk";
  
  ALTER TABLE "payload"."page_text" DROP CONSTRAINT "page_text_story_photo_id_media_id_fk";
  
  ALTER TABLE "payload"."page_text" DROP CONSTRAINT "page_text_statement_photo_id_media_id_fk";
  
  DROP INDEX "payload"."wedding_events_photo_idx";
  DROP INDEX "payload"."page_text_hero_hero_photo_idx";
  DROP INDEX "payload"."page_text_story_story_photo_idx";
  DROP INDEX "payload"."page_text_statement_statement_photo_idx";
  ALTER TABLE "payload"."wedding_events" DROP COLUMN "photo_id";
  ALTER TABLE "payload"."page_text" DROP COLUMN "hero_photo_id";
  ALTER TABLE "payload"."page_text" DROP COLUMN "nav_story";
  ALTER TABLE "payload"."page_text" DROP COLUMN "nav_celebration";
  ALTER TABLE "payload"."page_text" DROP COLUMN "nav_schedule";
  ALTER TABLE "payload"."page_text" DROP COLUMN "nav_rsvp";
  ALTER TABLE "payload"."page_text" DROP COLUMN "story_title";
  ALTER TABLE "payload"."page_text" DROP COLUMN "story_text";
  ALTER TABLE "payload"."page_text" DROP COLUMN "story_photo_id";
  ALTER TABLE "payload"."page_text" DROP COLUMN "statement_text";
  ALTER TABLE "payload"."page_text" DROP COLUMN "statement_note";
  ALTER TABLE "payload"."page_text" DROP COLUMN "statement_photo_id";`)
}
