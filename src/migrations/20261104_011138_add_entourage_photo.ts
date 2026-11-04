import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."entourage" ADD COLUMN "photo_id" integer;
  ALTER TABLE "payload"."entourage" ADD CONSTRAINT "entourage_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "entourage_photo_idx" ON "payload"."entourage" USING btree ("photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."entourage" DROP CONSTRAINT "entourage_photo_id_media_id_fk";
  
  DROP INDEX "payload"."entourage_photo_idx";
  ALTER TABLE "payload"."entourage" DROP COLUMN "photo_id";`)
}
