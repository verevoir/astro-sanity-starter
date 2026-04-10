import { defineBlock, text, richText, select } from "@verevoir/schema";

/**
 * Cards section — grid of feature cards. The `items` array is
 * preserved on save but not yet editable through the form.
 */
export const cardsSection = defineBlock({
  name: "cardsSection",
  fields: {
    heading: text("Heading")
      .max(120)
      .hint("Section title. e.g. 'Why us?', 'Features', 'How it works'."),
    body: richText("Body")
      .optional()
      .hint("Optional supporting copy below the heading."),
    columns: select("Columns", ["one", "two", "three"]).hint(
      "How many cards per row on desktop. Mobile is always one column.",
    ),
    theme: select("Theme", ["light", "dark"]).hint(
      "Switches the section background and text colour.",
    ),
    width: select("Width", ["full", "inset"]).hint(
      "`full` runs to the page edges. `inset` adds rounded corners and a max-width container.",
    ),
  },
});
