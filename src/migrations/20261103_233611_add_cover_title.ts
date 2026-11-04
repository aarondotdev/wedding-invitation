import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ALTER COLUMN "rsvp_form_decline" SET DEFAULT 'Regretfully decline';
  ALTER TABLE "payload"."page_text" ALTER COLUMN "pages_home_message" SET DEFAULT 'Page not found';
  ALTER TABLE "payload"."page_text" ALTER COLUMN "pages_invalid_link_title" SET DEFAULT 'Invalid code';
  ALTER TABLE "payload"."page_text" ADD COLUMN "cover_title" varchar DEFAULT 'You''re invited';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ALTER COLUMN "rsvp_form_decline" SET DEFAULT 'Regretfully declines';
  ALTER TABLE "payload"."page_text" ALTER COLUMN "pages_home_message" SET DEFAULT 'This celebration is by invitation. Please open the personal link we sent you to view your invitation.';
  ALTER TABLE "payload"."page_text" ALTER COLUMN "pages_invalid_link_title" SET DEFAULT 'Oh dear';
  ALTER TABLE "payload"."page_text" DROP COLUMN "cover_title";`)
}
