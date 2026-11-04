import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ADD COLUMN "cover_photo_id" integer;
  ALTER TABLE "payload"."page_text" ADD CONSTRAINT "page_text_cover_photo_id_media_id_fk" FOREIGN KEY ("cover_photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "page_text_cover_cover_photo_idx" ON "payload"."page_text" USING btree ("cover_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" DROP CONSTRAINT "page_text_cover_photo_id_media_id_fk";
  
  DROP INDEX "payload"."page_text_cover_cover_photo_idx";
  ALTER TABLE "payload"."page_text" DROP COLUMN "cover_photo_id";`)
}
