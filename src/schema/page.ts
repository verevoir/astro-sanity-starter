import { defineContentBlock } from "@verevoir/schema";
import { publishFields, tagsField } from "@verevoir/editor";

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
 *
 * publishFields + tagsField augment the block with workflow state
 * (draft/published/archived), a publish window (publishFrom /
 * publishTo as UTC ISO strings, edited via the smart datetime
 * control), and a tags array used by the tag scheduler to apply a
 * start/end window across many pages at once.
 */
export const page = defineContentBlock({
  name: "page",
  fields: {
    ...publishFields(),
    ...tagsField(),
  },
});
