import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" ADD COLUMN "nav_menu" varchar DEFAULT 'Menu';
  ALTER TABLE "payload"."page_text" ADD COLUMN "nav_close" varchar DEFAULT 'Close';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."page_text" DROP COLUMN "nav_menu";
  ALTER TABLE "payload"."page_text" DROP COLUMN "nav_close";`)
}
