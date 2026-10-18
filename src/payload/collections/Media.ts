import type { CollectionConfig } from "payload";

// Uploaded images (e.g. the link-preview banner). Stored in Vercel Blob in production.
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Image", plural: "Images" },
  access: { read: () => true },
  admin: { useAsTitle: "alt", description: "Photos used on the website." },
  upload: {
    mimeTypes: ["image/*"],
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
