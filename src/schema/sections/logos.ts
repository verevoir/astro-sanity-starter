import { defineBlock, text, richText, select } from "@verevoir/schema";

/**
 * Logos section — animated or static strip of customer/partner logos.
 * The `items` array of logo images is preserved on save but not yet
 * editable through the form.
 */
export const logosSection = defineBlock({
  name: "logosSection",
  fields: {
    heading: text("Heading")
      .optional()
      .hint("e.g. 'Trusted by', 'Built on'. Optional."),
    body: richText("Body").optional(),
    motion: select("Motion", ["static", "moveToLeft", "moveToRight"]).hint(
      "`static` displays logos in a row. The other two scroll horizontally.",
    ),
    theme: select("Theme", ["light", "dark"]).hint(
      "Switches the section background and text colour.",
    ),
    width: select("Width", ["full", "inset"]).hint(
      "`full` runs to the page edges. `inset` adds rounded corners and a max-width container.",
    ),
  },
});
