import { defineBlock, text, richText, select } from "@verevoir/schema";

/**
 * Testimonials section — quote cards from customers/partners.
 * The `items` array of testimonials is preserved on save but not
 * yet editable through the form.
 */
export const testimonialsSection = defineBlock({
  name: "testimonialsSection",
  fields: {
    heading: text("Heading")
      .max(120)
      .hint("Section title. e.g. 'What our customers say'."),
    body: richText("Body").optional(),
    columns: select("Columns", ["one", "two"]).hint(
      "How many testimonials per row on desktop.",
    ),
    theme: select("Theme", ["light", "dark"]).hint(
      "Switches the section background and text colour.",
    ),
    width: select("Width", ["full", "inset"]).hint(
      "`full` runs to the page edges. `inset` adds rounded corners and a max-width container.",
    ),
  },
});
