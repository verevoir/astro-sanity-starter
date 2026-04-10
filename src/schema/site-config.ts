import { defineBlock, text } from "@verevoir/schema";

export const siteConfig = defineBlock({
  name: "siteConfig",
  fields: {
    headerTitle: text("Site Title").hint(
      "The display name of the site. Shown in the header next to the logo.",
    ),
    titleSuffix: text("Title Suffix")
      .optional()
      .hint(
        "Appended to page titles in browser tabs (e.g. `About Us | Acme`). Leave blank to disable.",
      ),
  },
});
