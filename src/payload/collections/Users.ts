import type { CollectionConfig } from "payload";

// CMS editors. Separate from the Supabase accounts that sign in to the guest admin.
export const Users: CollectionConfig = {
  slug: "users",
  admin: { useAsTitle: "email" },
  auth: true,
  fields: [],
};
