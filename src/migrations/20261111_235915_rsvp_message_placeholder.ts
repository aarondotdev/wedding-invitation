import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ALTER COLUMN "rsvp_form_message_placeholder" SET DEFAULT 'Please note any food allergies or dietary restrictions';
   UPDATE "payload"."page_text" SET "rsvp_form_message_placeholder" = 'Please note any food allergies or dietary restrictions' WHERE "rsvp_form_message_placeholder" = 'Dietary needs or a note for the couple';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ALTER COLUMN "rsvp_form_message_placeholder" SET DEFAULT 'Dietary needs or a note for the couple';
   UPDATE "payload"."page_text" SET "rsvp_form_message_placeholder" = 'Dietary needs or a note for the couple' WHERE "rsvp_form_message_placeholder" = 'Please note any food allergies or dietary restrictions';`)
}
