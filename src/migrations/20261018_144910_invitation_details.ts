import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."page_text_story_chapters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE "payload"."entourage_parents_names" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."entourage_parents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."entourage_sponsors_names" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."entourage_entourage_names" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."entourage_entourage" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."entourage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Family & Entourage',
  	"intro" varchar DEFAULT 'With grateful hearts, we honour the people who guide us and stand beside us on our wedding day.',
  	"sponsors_title" varchar DEFAULT 'Principal Sponsors',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."details_dress_code_palette" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"color" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."details_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."details_gallery_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer NOT NULL
  );
  
  CREATE TABLE "payload"."details" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"dress_code_title" varchar DEFAULT 'Dress Code',
  	"dress_code_description" varchar DEFAULT 'We kindly ask our guests to come in formal or semi-formal attire. Please avoid wearing white, which we''re saving for the bride, and very bright neon colours.',
  	"dress_code_note" varchar DEFAULT 'If you''d like to match our day, here are a few colours we love.',
  	"dress_code_photo_id" integer,
  	"faq_title" varchar DEFAULT 'Questions & Answers',
  	"faq_intro" varchar DEFAULT 'In case you''re wondering',
  	"gallery_title" varchar DEFAULT 'Moments',
  	"gallery_intro" varchar DEFAULT 'A few of our favourite memories so far.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload"."page_text" ADD COLUMN "nav_entourage" varchar DEFAULT 'Entourage';
  ALTER TABLE "payload"."page_text" ADD COLUMN "nav_details" varchar DEFAULT 'Details';
  ALTER TABLE "payload"."page_text" ADD COLUMN "nav_gallery" varchar DEFAULT 'Gallery';
  ALTER TABLE "payload"."page_text" ADD COLUMN "nav_faq" varchar DEFAULT 'FAQ';
  ALTER TABLE "payload"."page_text" ADD COLUMN "statement_band_photo_id" integer;
  ALTER TABLE "payload"."page_text" ADD COLUMN "statement_secondary_photo_id" integer;
  ALTER TABLE "payload"."page_text_story_chapters" ADD CONSTRAINT "page_text_story_chapters_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."page_text_story_chapters" ADD CONSTRAINT "page_text_story_chapters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."page_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."entourage_parents_names" ADD CONSTRAINT "entourage_parents_names_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."entourage_parents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."entourage_parents" ADD CONSTRAINT "entourage_parents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."entourage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."entourage_sponsors_names" ADD CONSTRAINT "entourage_sponsors_names_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."entourage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."entourage_entourage_names" ADD CONSTRAINT "entourage_entourage_names_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."entourage_entourage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."entourage_entourage" ADD CONSTRAINT "entourage_entourage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."entourage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."details_dress_code_palette" ADD CONSTRAINT "details_dress_code_palette_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."details"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."details_faq_items" ADD CONSTRAINT "details_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."details"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."details_gallery_photos" ADD CONSTRAINT "details_gallery_photos_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."details_gallery_photos" ADD CONSTRAINT "details_gallery_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."details"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."details" ADD CONSTRAINT "details_dress_code_photo_id_media_id_fk" FOREIGN KEY ("dress_code_photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "page_text_story_chapters_order_idx" ON "payload"."page_text_story_chapters" USING btree ("_order");
  CREATE INDEX "page_text_story_chapters_parent_id_idx" ON "payload"."page_text_story_chapters" USING btree ("_parent_id");
  CREATE INDEX "page_text_story_chapters_photo_idx" ON "payload"."page_text_story_chapters" USING btree ("photo_id");
  CREATE INDEX "entourage_parents_names_order_idx" ON "payload"."entourage_parents_names" USING btree ("_order");
  CREATE INDEX "entourage_parents_names_parent_id_idx" ON "payload"."entourage_parents_names" USING btree ("_parent_id");
  CREATE INDEX "entourage_parents_order_idx" ON "payload"."entourage_parents" USING btree ("_order");
  CREATE INDEX "entourage_parents_parent_id_idx" ON "payload"."entourage_parents" USING btree ("_parent_id");
  CREATE INDEX "entourage_sponsors_names_order_idx" ON "payload"."entourage_sponsors_names" USING btree ("_order");
  CREATE INDEX "entourage_sponsors_names_parent_id_idx" ON "payload"."entourage_sponsors_names" USING btree ("_parent_id");
  CREATE INDEX "entourage_entourage_names_order_idx" ON "payload"."entourage_entourage_names" USING btree ("_order");
  CREATE INDEX "entourage_entourage_names_parent_id_idx" ON "payload"."entourage_entourage_names" USING btree ("_parent_id");
  CREATE INDEX "entourage_entourage_order_idx" ON "payload"."entourage_entourage" USING btree ("_order");
  CREATE INDEX "entourage_entourage_parent_id_idx" ON "payload"."entourage_entourage" USING btree ("_parent_id");
  CREATE INDEX "details_dress_code_palette_order_idx" ON "payload"."details_dress_code_palette" USING btree ("_order");
  CREATE INDEX "details_dress_code_palette_parent_id_idx" ON "payload"."details_dress_code_palette" USING btree ("_parent_id");
  CREATE INDEX "details_faq_items_order_idx" ON "payload"."details_faq_items" USING btree ("_order");
  CREATE INDEX "details_faq_items_parent_id_idx" ON "payload"."details_faq_items" USING btree ("_parent_id");
  CREATE INDEX "details_gallery_photos_order_idx" ON "payload"."details_gallery_photos" USING btree ("_order");
  CREATE INDEX "details_gallery_photos_parent_id_idx" ON "payload"."details_gallery_photos" USING btree ("_parent_id");
  CREATE INDEX "details_gallery_photos_photo_idx" ON "payload"."details_gallery_photos" USING btree ("photo_id");
  CREATE INDEX "details_dress_code_dress_code_photo_idx" ON "payload"."details" USING btree ("dress_code_photo_id");
  ALTER TABLE "payload"."page_text" ADD CONSTRAINT "page_text_statement_band_photo_id_media_id_fk" FOREIGN KEY ("statement_band_photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."page_text" ADD CONSTRAINT "page_text_statement_secondary_photo_id_media_id_fk" FOREIGN KEY ("statement_secondary_photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "page_text_statement_statement_band_photo_idx" ON "payload"."page_text" USING btree ("statement_band_photo_id");
  CREATE INDEX "page_text_statement_statement_secondary_photo_idx" ON "payload"."page_text" USING btree ("statement_secondary_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text_story_chapters" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."entourage_parents_names" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."entourage_parents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."entourage_sponsors_names" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."entourage_entourage_names" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."entourage_entourage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."entourage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."details_dress_code_palette" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."details_faq_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."details_gallery_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."details" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."page_text_story_chapters" CASCADE;
  DROP TABLE "payload"."entourage_parents_names" CASCADE;
  DROP TABLE "payload"."entourage_parents" CASCADE;
  DROP TABLE "payload"."entourage_sponsors_names" CASCADE;
  DROP TABLE "payload"."entourage_entourage_names" CASCADE;
  DROP TABLE "payload"."entourage_entourage" CASCADE;
  DROP TABLE "payload"."entourage" CASCADE;
  DROP TABLE "payload"."details_dress_code_palette" CASCADE;
  DROP TABLE "payload"."details_faq_items" CASCADE;
  DROP TABLE "payload"."details_gallery_photos" CASCADE;
  DROP TABLE "payload"."details" CASCADE;
  ALTER TABLE "payload"."page_text" DROP CONSTRAINT "page_text_statement_band_photo_id_media_id_fk";
  
  ALTER TABLE "payload"."page_text" DROP CONSTRAINT "page_text_statement_secondary_photo_id_media_id_fk";
  
  DROP INDEX "payload"."page_text_statement_statement_band_photo_idx";
  DROP INDEX "payload"."page_text_statement_statement_secondary_photo_idx";
  ALTER TABLE "payload"."page_text" DROP COLUMN "nav_entourage";
  ALTER TABLE "payload"."page_text" DROP COLUMN "nav_details";
  ALTER TABLE "payload"."page_text" DROP COLUMN "nav_gallery";
  ALTER TABLE "payload"."page_text" DROP COLUMN "nav_faq";
  ALTER TABLE "payload"."page_text" DROP COLUMN "statement_band_photo_id";
  ALTER TABLE "payload"."page_text" DROP COLUMN "statement_secondary_photo_id";`)
}
