import { defineBlock, text, boolean } from "@verevoir/schema";

export const page = defineBlock({
  name: "page",
  fields: {
    title: text("Title")
      .max(120)
      .hint(
        "Internal name for this page. Shown in the admin and used as the default browser tab title.",
      ),
    slug: text("Slug").hint(
      "URL path. Use `/` for the homepage. Other pages should be lowercase, hyphenated, no leading slash needed.",
    ),
    metaTitle: text("Meta Title")
      .max(70)
      .optional()
      .hint(
        "Title shown in browser tabs, search engine results, and social shares. Aim for under 60 characters. Falls back to the page title if blank.",
      ),
    addTitleSuffix: boolean("Add Title Suffix")
      .default(true)
      .hint(
        "Append the site title suffix (e.g. ` | Acme`) after the page title in browser tabs.",
      ),
    metaDescription: text("Meta Description")
      .max(160)
      .optional()
      .hint(
        "One-sentence summary used by search engines and social previews. 120–160 characters works best.",
      ),
  },
});
