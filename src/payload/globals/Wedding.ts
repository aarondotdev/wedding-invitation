import { revalidateTag } from "next/cache";
import type { GlobalConfig } from "payload";
import { WEDDING_CACHE_TAG, weddingDefaults } from "@/lib/wedding-defaults";

const dateTime = { date: { pickerAppearance: "dayAndTime" as const } };

export const Wedding: GlobalConfig = {
  slug: "wedding",
  label: "Wedding details",
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        // Expire immediately so the couple sees their edit on the next page load
        revalidateTag(WEDDING_CACHE_TAG, { expire: 0 });
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "partner1", type: "text", required: true, defaultValue: weddingDefaults.partner1 },
        { name: "partner2", type: "text", required: true, defaultValue: weddingDefaults.partner2 },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "date",
          type: "date",
          required: true,
          defaultValue: weddingDefaults.date,
          admin: { ...dateTime, description: "Start of the ceremony. Drives the countdown." },
        },
        {
          name: "displayDate",
          type: "text",
          required: true,
          defaultValue: weddingDefaults.displayDate,
          admin: { description: "How the date is written on the invitation." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "rsvpDeadline",
          type: "date",
          required: true,
          defaultValue: weddingDefaults.rsvpDeadline,
          admin: { ...dateTime, description: "RSVPs are accepted until this moment." },
        },
        {
          name: "rsvpBy",
          type: "text",
          required: true,
          defaultValue: weddingDefaults.rsvpBy,
          admin: { description: "How the deadline is written on the invitation." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "hashtag", type: "text", defaultValue: weddingDefaults.hashtag },
        { name: "dressCode", type: "text", defaultValue: weddingDefaults.dressCode },
      ],
    },
    {
      name: "events",
      type: "array",
      minRows: 1,
      required: true,
      defaultValue: weddingDefaults.events,
      admin: { description: "The first event's venue is shown under the date." },
      fields: [
        {
          type: "row",
          fields: [
            { name: "title", type: "text", required: true },
            { name: "time", type: "text", required: true },
          ],
        },
        { name: "venue", type: "text", required: true },
        { name: "address", type: "text", required: true },
        { name: "mapUrl", type: "text", label: "Map URL" },
      ],
    },
    {
      name: "schedule",
      type: "array",
      label: "Order of the day",
      defaultValue: weddingDefaults.schedule,
      fields: [
        {
          type: "row",
          fields: [
            { name: "time", type: "text", required: true },
            { name: "item", type: "text", required: true },
          ],
        },
      ],
    },
  ],
};
