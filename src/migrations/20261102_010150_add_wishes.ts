import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."wishes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"hidden" boolean DEFAULT false,
  	"guest_id" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload"."page_text" ALTER COLUMN "sections_schedule_title" SET DEFAULT 'Wedding Timeline';
  ALTER TABLE "payload"."details" ALTER COLUMN "dress_code_title" SET DEFAULT 'THE VENUES';
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "wishes_id" integer;
  ALTER TABLE "payload"."page_text" ADD COLUMN "nav_wishes" varchar DEFAULT 'Wishes';
  ALTER TABLE "payload"."page_text" ADD COLUMN "wishes_title" varchar DEFAULT 'Well Wishes';
  ALTER TABLE "payload"."page_text" ADD COLUMN "wishes_intro" varchar DEFAULT 'Leave a message for the couple. Everyone who opens their invitation can read it.';
  ALTER TABLE "payload"."page_text" ADD COLUMN "wishes_placeholder" varchar DEFAULT 'Write your congratulations here…';
  ALTER TABLE "payload"."page_text" ADD COLUMN "wishes_send_button" varchar DEFAULT 'Post message';
  ALTER TABLE "payload"."page_text" ADD COLUMN "wishes_update_button" varchar DEFAULT 'Update message';
  ALTER TABLE "payload"."page_text" ADD COLUMN "wishes_sending_button" varchar DEFAULT 'Posting…';
  ALTER TABLE "payload"."page_text" ADD COLUMN "wishes_thanks" varchar DEFAULT 'Thank you, {name}! Your message is up.';
  ALTER TABLE "payload"."page_text" ADD COLUMN "wishes_already_posted" varchar DEFAULT 'You''ve left a message. You can change it below.';
  ALTER TABLE "payload"."page_text" ADD COLUMN "wishes_empty" varchar DEFAULT 'Be the first to leave a message.';
  ALTER TABLE "payload"."page_text" ADD COLUMN "wishes_error_empty" varchar DEFAULT 'Please write a message first.';
  ALTER TABLE "payload"."page_text" ADD COLUMN "wishes_error_invalid_link" varchar DEFAULT 'This invitation link is no longer valid.';
  ALTER TABLE "payload"."page_text" ADD COLUMN "wishes_error_generic" varchar DEFAULT 'Something went wrong saving your message. Please try again.';
  CREATE UNIQUE INDEX "wishes_guest_id_idx" ON "payload"."wishes" USING btree ("guest_id");
  CREATE INDEX "wishes_updated_at_idx" ON "payload"."wishes" USING btree ("updated_at");
  CREATE INDEX "wishes_created_at_idx" ON "payload"."wishes" USING btree ("created_at");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_wishes_fk" FOREIGN KEY ("wishes_id") REFERENCES "payload"."wishes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_wishes_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("wishes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."wishes" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."wishes" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_wishes_fk";
  
  DROP INDEX "payload"."payload_locked_documents_rels_wishes_id_idx";
  ALTER TABLE "payload"."page_text" ALTER COLUMN "sections_schedule_title" SET DEFAULT 'Order of the Day';
  ALTER TABLE "payload"."details" ALTER COLUMN "dress_code_title" SET DEFAULT 'Dress Code';
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "wishes_id";
  ALTER TABLE "payload"."page_text" DROP COLUMN "nav_wishes";
  ALTER TABLE "payload"."page_text" DROP COLUMN "wishes_title";
  ALTER TABLE "payload"."page_text" DROP COLUMN "wishes_intro";
  ALTER TABLE "payload"."page_text" DROP COLUMN "wishes_placeholder";
  ALTER TABLE "payload"."page_text" DROP COLUMN "wishes_send_button";
  ALTER TABLE "payload"."page_text" DROP COLUMN "wishes_update_button";
  ALTER TABLE "payload"."page_text" DROP COLUMN "wishes_sending_button";
  ALTER TABLE "payload"."page_text" DROP COLUMN "wishes_thanks";
  ALTER TABLE "payload"."page_text" DROP COLUMN "wishes_already_posted";
  ALTER TABLE "payload"."page_text" DROP COLUMN "wishes_empty";
  ALTER TABLE "payload"."page_text" DROP COLUMN "wishes_error_empty";
  ALTER TABLE "payload"."page_text" DROP COLUMN "wishes_error_invalid_link";
  ALTER TABLE "payload"."page_text" DROP COLUMN "wishes_error_generic";`)
}
