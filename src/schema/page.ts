import { defineBlock, text, boolean } from "@verevoir/schema";

export const page = defineBlock({
  name: "page",
  fields: {
    title: text("Title").max(120),
    slug: text("Slug"),
    metaTitle: text("Meta Title").max(70).optional(),
    addTitleSuffix: boolean("Add Title Suffix").default(true),
    metaDescription: text("Meta Description").max(160).optional(),
  },
});
