import { defineBlock, text } from "@verevoir/schema";

export const siteConfig = defineBlock({
  name: "siteConfig",
  fields: {
    headerTitle: text("Site Title"),
    titleSuffix: text("Title Suffix").optional(),
  },
});
