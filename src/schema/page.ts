import { defineContentBlock } from "@verevoir/schema";

/**
 * The starter's page block. Uses `defineContentBlock` so the
 * universal document metadata fields (title, slug, metaTitle,
 * metaDescription, addTitleSuffix) are injected automatically and
 * carry the `isMeta` marker the admin uses to bucket them into
 * the Document tab's left column.
 *
 * Polymorphic page sections are not modelled in the block —
 * they're stored on `data.sections` as a discriminated-union
 * array and edited by the admin's SectionsEditor outside the
 * schema validator.
 */
export const page = defineContentBlock({
  name: "page",
  fields: {
    // No author-specific fields yet — page content is the
    // sections array, handled outside the schema. Add custom
    // fields here as needed (e.g. `theme`, `layout`, etc.).
  },
});
