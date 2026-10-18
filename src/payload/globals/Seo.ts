import { revalidateTag } from "next/cache";
import type { GlobalConfig } from "payload";
import { SEO_CACHE_TAG, seoDefaults } from "@/lib/site-content-defaults";

const AUTO = "Leave empty to use the automatic wording, which updates with the names and date.";

export const Seo: GlobalConfig = {
  slug: "seo",
  label: "Sharing & SEO",
  admin: {
    description:
      "How the website appears in browser tabs and when a link is shared in WhatsApp, Messenger, Viber or iMessage. Chat apps can take a while to show changes for links shared before.",
  },
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        revalidateTag(SEO_CACHE_TAG, { expire: 0 });
      },
    ],
  },
  fields: [
    {
      type: "collapsible",
      label: "Browser tab",
      fields: [
        {
          name: "title",
          type: "text",
          label: "Page title",
          defaultValue: seoDefaults.title,
          admin: { description: `Text on the browser tab. Automatic: "Lorenz and Jenzell". ${AUTO}` },
        },
        {
          name: "description",
          type: "textarea",
          label: "Page description",
          defaultValue: seoDefaults.description,
          admin: { description: `One sentence about the invitation. No venue details — anyone with the link can see it. ${AUTO}` },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Link preview (chat apps)",
      fields: [
        {
          name: "shareTitle",
          type: "text",
          label: "Preview title",
          defaultValue: seoDefaults.shareTitle,
          admin: { description: `Bold title in the preview. Automatic: "You're invited: Lorenz and Jenzell". ${AUTO}` },
        },
        {
          name: "shareDescription",
          type: "textarea",
          label: "Preview text",
          defaultValue: seoDefaults.shareDescription,
          admin: { description: `Text under the title. Uses the page description when empty.` },
        },
        {
          name: "shareImage",
          type: "upload",
          relationTo: "media",
          label: "Preview image",
          admin: {
            description:
              "Best size: 1200 × 630 pixels (wide), under 300 KB, faces near the middle. Leave empty to use the built-in photo.",
          },
        },
        {
          name: "shareImageAlt",
          type: "text",
          label: "Preview image description",
          defaultValue: seoDefaults.shareImageAlt,
          admin: { description: "Describes the built-in photo. An uploaded image uses its own description instead." },
        },
      ],
    },
  ],
};
