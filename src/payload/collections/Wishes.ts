import type { CollectionConfig } from "payload";

// Congratulations messages left by guests on their invitation. Guests post through the website
// (the server writes here with the local API); in the CMS the couple can read, hide or delete them.
export const Wishes: CollectionConfig = {
  slug: "wishes",
  labels: { singular: "Well wish", plural: "Well wishes" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "message", "hidden", "updatedAt"],
    description:
      "Messages guests have left in the \"Well wishes\" section. Everyone with an invitation can read them. To take one down without deleting it, tick \"Hide from the invitation\".",
  },
  // Only signed-in CMS users; the website reads and writes through the server, which bypasses this.
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "name",
      label: "Guest",
      type: "text",
      required: true,
      admin: { description: "The guest's name as it appears on the invitation." },
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      required: true,
      maxLength: 500,
      admin: { description: "What the guest wrote. You can tidy a typo here; the guest can also post again to replace it." },
    },
    {
      name: "hidden",
      label: "Hide from the invitation",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Tick to stop showing this message on the website. Untick to show it again." },
    },
    {
      name: "guestId",
      label: "Guest record",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true, description: "Links the message to the guest list (one message per guest).", position: "sidebar" },
    },
  ],
};
