import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."entourage" ALTER COLUMN "intro" SET DEFAULT 'With grateful hearts, we honor the people who guide us and stand beside us on our wedding day.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."entourage" ALTER COLUMN "intro" SET DEFAULT 'With grateful hearts, we honour the people who guide us and stand beside us on our wedding day.';`)
}
