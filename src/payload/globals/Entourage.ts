import { expireTags } from "@/lib/revalidate";
import type { Field, GlobalConfig } from "payload";
import { ENTOURAGE_CACHE_TAG, entourageDefaults, type NameGroup } from "@/lib/details-defaults";

const toRows = (names: string[]) => names.map((name) => ({ name }));

// A list of people under a heading, e.g. "Bridesmaids" → names
function nameList(label: string, description: string): Field {
  return {
    name: "names",
    label,
    type: "array",
    admin: { description, initCollapsed: false },
    labels: { singular: "Name", plural: "Names" },
    fields: [{ name: "name", type: "text", required: true, label: "Full name" }],
  };
}

const groupsField = (name: string, label: string, description: string, defaults: NameGroup[]): Field => ({
  name,
  label,
  type: "array",
  labels: { singular: "Group", plural: "Groups" },
  admin: { description, initCollapsed: true },
  defaultValue: defaults.map((g) => ({ title: g.title, names: toRows(g.names) })),
  fields: [
    { name: "title", type: "text", required: true, label: "Heading", admin: { description: "e.g. \"Bridesmaids\" or \"Parents of the Bride\"." } },
    nameList("People", "One name per row. Drag rows to change the order."),
  ],
});

export const Entourage: GlobalConfig = {
  slug: "entourage",
  label: "Family & entourage",
  admin: { description: "Parents, principal sponsors and the entourage, shown in their own section of the invitation." },
  access: { read: () => true },
  hooks: {
    afterChange: [
      () => {
        expireTags(ENTOURAGE_CACHE_TAG);
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Section heading",
      defaultValue: entourageDefaults.title,
      admin: { description: "Large heading of the section." },
    },
    {
      name: "intro",
      type: "textarea",
      label: "Introduction",
      defaultValue: entourageDefaults.intro,
      admin: { description: "A sentence under the heading. Leave empty to hide it." },
    },
    groupsField("parents", "Parents", "Usually two groups: the groom's parents and the bride's parents.", entourageDefaults.parents),
    {
      name: "sponsors",
      label: "Principal sponsors",
      type: "group",
      fields: [
        {
          name: "title",
          type: "text",
          label: "Heading",
          defaultValue: entourageDefaults.sponsors.title,
        },
        {
          ...nameList("Sponsors", "One name per row. Shown in two columns."),
          defaultValue: toRows(entourageDefaults.sponsors.names),
        } as Field,
      ],
    },
    groupsField(
      "entourage",
      "Entourage",
      "Best man, maid of honour, groomsmen, bridesmaids, secondary sponsors, bearers and flower girls. Add, remove or reorder groups freely.",
      entourageDefaults.entourage,
    ),
  ],
};
