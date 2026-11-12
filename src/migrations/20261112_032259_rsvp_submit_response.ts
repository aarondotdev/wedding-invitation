import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ALTER COLUMN "rsvp_form_update_button" SET DEFAULT 'Submit response';
   UPDATE "payload"."page_text" SET "rsvp_form_update_button" = 'Submit response' WHERE "rsvp_form_update_button" = 'Update RSVP';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ALTER COLUMN "rsvp_form_update_button" SET DEFAULT 'Update RSVP';
   UPDATE "payload"."page_text" SET "rsvp_form_update_button" = 'Update RSVP' WHERE "rsvp_form_update_button" = 'Submit response';`)
}
