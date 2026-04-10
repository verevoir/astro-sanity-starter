import {
  defineBlock,
  text,
  richText,
  select,
  array,
  object,
} from "@verevoir/schema";

/**
 * Logos section — animated or static strip of customer/partner logos.
 * Items render as CardGridArrayField; the dimensions object is
 * preserved on save but not modeled here (it's derived metadata).
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
    items: array(
      "Logos",
      object("Logo", {
        src: text("Image path").hint(
          "Public path to the logo file (e.g. `/images/logo-acme.svg`).",
        ),
        alt: text("Alt text").hint("Used by screen readers and as fallback."),
      }),
    ).hint(
      "Logos to display in the strip. The dimensions metadata is preserved on save but managed automatically.",
    ),
  },
});
