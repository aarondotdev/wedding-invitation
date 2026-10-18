import { revalidateTag } from "next/cache";
import type { CollectionConfig } from "payload";
import { PAGE_TEXT_CACHE_TAG, SEO_CACHE_TAG } from "@/lib/site-content-defaults";
import { WEDDING_CACHE_TAG } from "@/lib/wedding-defaults";

// Pages cache which photos they show; refresh them when an image is replaced, edited or deleted
// so a removed photo doesn't leave a broken image behind.
const refreshPagesUsingImages = () => {
  for (const tag of [PAGE_TEXT_CACHE_TAG, SEO_CACHE_TAG, WEDDING_CACHE_TAG]) revalidateTag(tag, { expire: 0 });
};

// Uploaded images (e.g. the link-preview banner). Stored in Vercel Blob in production.
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Image", plural: "Images" },
  access: { read: () => true },
  admin: { useAsTitle: "alt", description: "Photos used on the website." },
  upload: {
    mimeTypes: ["image/*"],
  },
  hooks: {
    afterChange: [refreshPagesUsingImages],
    afterDelete: [refreshPagesUsingImages],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Description",
      admin: {
        description:
          "Describe the photo in a few words, e.g. \"Lorenz and Jenzell under a crescent moon\". Read aloud to people using screen readers.",
      },
    },
  ],
};
