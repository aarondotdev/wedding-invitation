import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"prefix" varchar DEFAULT '',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload"."page_text" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_greeting" varchar DEFAULT 'Dear {name},',
  	"hero_intro" varchar DEFAULT 'Together with their families',
  	"hero_ampersand" varchar DEFAULT '&',
  	"hero_invitation_line" varchar DEFAULT 'request the pleasure of your company',
  	"hero_rsvp_button" varchar DEFAULT 'RSVP',
  	"sections_countdown_title" varchar DEFAULT 'Counting down',
  	"sections_events_title" varchar DEFAULT 'The Celebration',
  	"sections_view_map" varchar DEFAULT 'View map',
  	"sections_dress_code_label" varchar DEFAULT 'Dress code:',
  	"sections_schedule_title" varchar DEFAULT 'Order of the Day',
  	"sections_rsvp_title" varchar DEFAULT 'Kindly Reply',
  	"sections_respond_by" varchar DEFAULT 'Please respond by {date}',
  	"countdown_days" varchar DEFAULT 'Days',
  	"countdown_hours" varchar DEFAULT 'Hours',
  	"countdown_minutes" varchar DEFAULT 'Minutes',
  	"countdown_seconds" varchar DEFAULT 'Seconds',
  	"rsvp_form_accept" varchar DEFAULT 'Joyfully accepts',
  	"rsvp_form_decline" varchar DEFAULT 'Regretfully declines',
  	"rsvp_form_guest_singular" varchar DEFAULT 'guest',
  	"rsvp_form_guest_plural" varchar DEFAULT 'guests',
  	"rsvp_form_guest_count_label" varchar DEFAULT 'Number of guests attending',
  	"rsvp_form_message_placeholder" varchar DEFAULT 'Dietary needs or a note for the couple',
  	"rsvp_form_send_button" varchar DEFAULT 'Send RSVP',
  	"rsvp_form_update_button" varchar DEFAULT 'Update RSVP',
  	"rsvp_form_sending_button" varchar DEFAULT 'Sending…',
  	"rsvp_messages_already_replied" varchar DEFAULT 'You''ve already replied. Feel free to update your response below.',
  	"rsvp_messages_thanks_attending" varchar DEFAULT 'Thank you, {name}! We can''t wait to celebrate with you.',
  	"rsvp_messages_thanks_declined" varchar DEFAULT 'Thank you for letting us know, {name}. You''ll be missed!',
  	"rsvp_messages_closed" varchar DEFAULT 'RSVPs have closed. For any changes, please contact the couple directly.',
  	"rsvp_messages_no_response" varchar DEFAULT 'We haven''t received your response.',
  	"rsvp_messages_recorded_attending" varchar DEFAULT 'You''re coming with {count} in total. We can''t wait!',
  	"rsvp_messages_recorded_declined" varchar DEFAULT 'You let us know you can''t make it. You''ll be missed!',
  	"rsvp_messages_error_closed" varchar DEFAULT 'RSVPs have closed. Please contact the couple directly.',
  	"rsvp_messages_error_invalid_link" varchar DEFAULT 'This invitation link is no longer valid.',
  	"rsvp_messages_error_choose_attendance" varchar DEFAULT 'Please let us know whether you can attend.',
  	"rsvp_messages_error_guest_count" varchar DEFAULT 'Please choose between 1 and {max}.',
  	"rsvp_messages_error_generic" varchar DEFAULT 'Something went wrong saving your RSVP. Please try again.',
  	"pages_home_message" varchar DEFAULT 'This celebration is by invitation. Please open the personal link we sent you to view your invitation.',
  	"pages_invalid_link_title" varchar DEFAULT 'Oh dear',
  	"pages_invalid_link_message" varchar DEFAULT 'This invitation link isn''t valid. Please check the link you received, or reach out to the couple for a new one.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."seo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT '',
  	"description" varchar DEFAULT '',
  	"share_title" varchar DEFAULT '',
  	"share_description" varchar DEFAULT '',
  	"share_image_id" integer,
  	"share_image_alt" varchar DEFAULT 'Lorenz and Jenzell under a glowing crescent moon',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "payload"."seo" ADD CONSTRAINT "seo_share_image_id_media_id_fk" FOREIGN KEY ("share_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE INDEX "seo_share_image_idx" ON "payload"."seo" USING btree ("share_image_id");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."page_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."seo" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."page_text" CASCADE;
  DROP TABLE "payload"."seo" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";
  
  DROP INDEX "payload"."payload_locked_documents_rels_media_id_idx";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "media_id";`)
}
