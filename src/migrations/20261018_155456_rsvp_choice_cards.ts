import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ADD COLUMN "rsvp_form_accept_note" varchar DEFAULT 'We''ll be there to celebrate';
  ALTER TABLE "payload"."page_text" ADD COLUMN "rsvp_form_decline_note" varchar DEFAULT 'Sending our love from afar';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" DROP COLUMN "rsvp_form_accept_note";
  ALTER TABLE "payload"."page_text" DROP COLUMN "rsvp_form_decline_note";`)
}
