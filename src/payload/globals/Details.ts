import { expireTags } from "@/lib/revalidate";
import type { GlobalConfig } from "payload";
import { DETAILS_CACHE_TAG, detailsDefaults } from "@/lib/details-defaults";

const HEX = /^#[0-9a-f]{6}$/i;

export const Details: GlobalConfig = {
  slug: "details",
  label: "Guest details",
  admin: { description: "Dress code, frequently asked questions and the photo gallery." },
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        expireTags(DETAILS_CACHE_TAG);
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "dressCode",
          label: "Dress code",
          fields: [
            { name: "title", type: "text", label: "Heading", defaultValue: detailsDefaults.dressCode.title },
            {
              name: "description",
              type: "textarea",
              label: "What to wear",
              defaultValue: detailsDefaults.dressCode.description,
              admin: { description: "Explain the attire. The short dress-code line in Wedding details is shown with the venues." },
            },
            {
              name: "note",
              type: "textarea",
              label: "Line above the colours",
              defaultValue: detailsDefaults.dressCode.note,
              admin: { description: "Leave empty to hide it." },
            },
            {
              name: "palette",
              type: "array",
              label: "Colour palette",
              labels: { singular: "Colour", plural: "Colours" },
              defaultValue: detailsDefaults.dressCode.palette,
              admin: { description: "Shown as colour swatches. Leave empty to hide the palette." },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "name", type: "text", required: true, label: "Colour name", admin: { description: "e.g. Sage" } },
                    {
                      name: "color",
                      type: "text",
                      required: true,
                      label: "Colour code",
                      admin: { description: "A hex code like #A3B18A. Find one at htmlcolorcodes.com." },
                      validate: (value: unknown) =>
                        typeof value === "string" && HEX.test(value.trim()) ? true : "Use a 6-digit hex code, e.g. #A3B18A",
                    },
                  ],
                },
              ],
            },
            {
              name: "photo",
              type: "upload",
              relationTo: "media",
              label: "Attire photo",
              admin: { description: "Optional photo or illustration of the attire." },
            },
          ],
        },
        {
          name: "faq",
          label: "Questions & answers",
          fields: [
            { name: "title", type: "text", label: "Heading", defaultValue: detailsDefaults.faq.title },
            { name: "intro", type: "text", label: "Small line above the heading", defaultValue: detailsDefaults.faq.intro },
            {
              name: "items",
              type: "array",
              label: "Questions",
              labels: { singular: "Question", plural: "Questions" },
              defaultValue: detailsDefaults.faq.items,
              admin: { description: "Guests tap a question to see its answer. Drag to reorder." },
              fields: [
                { name: "question", type: "text", required: true, label: "Question" },
                { name: "answer", type: "textarea", required: true, label: "Answer" },
              ],
            },
          ],
        },
        {
          name: "gallery",
          label: "Gallery",
          fields: [
            { name: "title", type: "text", label: "Heading", defaultValue: detailsDefaults.gallery.title },
            { name: "intro", type: "text", label: "Introduction", defaultValue: detailsDefaults.gallery.intro },
            {
              name: "photos",
              type: "array",
              label: "Photos",
              labels: { singular: "Photo", plural: "Photos" },
              admin: { description: "Shown in this order. On computers they scroll sideways; leave empty to hide the gallery." },
              fields: [{ name: "photo", type: "upload", relationTo: "media", required: true, label: "Photo" }],
            },
          ],
        },
      ],
    },
  ],
};
