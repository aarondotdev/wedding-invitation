import { expireTags } from "@/lib/revalidate";
import type { CollectionConfig } from "payload";
import { PAGE_TEXT_CACHE_TAG, SEO_CACHE_TAG } from "@/lib/site-content-defaults";
import { DETAILS_CACHE_TAG, ENTOURAGE_CACHE_TAG } from "@/lib/details-defaults";
import { WEDDING_CACHE_TAG } from "@/lib/wedding-defaults";

// Pages cache which photos they show; refresh them when an image is replaced, edited or deleted
// so a removed photo doesn't leave a broken image behind.
const refreshPagesUsingImages = () => {
  expireTags(PAGE_TEXT_CACHE_TAG, SEO_CACHE_TAG, WEDDING_CACHE_TAG, DETAILS_CACHE_TAG, ENTOURAGE_CACHE_TAG);
};

// Uploaded images (e.g. the link-preview banner). Stored in Vercel Blob in production.
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Image", plural: "Images" },
  access: { read: () => true },
  admin: { useAsTitle: "alt", description: "Photos used on the website." },
  upload: {
    mimeTypes: ["image/*"],
    // Shrink camera originals (often 6000px, 10-25 MB) to at most 2560px on the long side when
    // uploaded. The site never shows a photo wider than 1920px, and smaller originals make the
    // resized copies guests download much quicker to produce.
    resizeOptions: { width: 2560, height: 2560, fit: "inside", withoutEnlargement: true },
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
