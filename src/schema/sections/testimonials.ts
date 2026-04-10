import {
  defineBlock,
  text,
  richText,
  select,
  boolean,
  array,
  object,
} from "@verevoir/schema";

/**
 * Testimonials section — quote cards from customers/partners.
 * Items render as CardGridArrayField (the author object is nested).
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
    items: array(
      "Testimonials",
      object("Testimonial", {
        quote: richText("Quote").hint(
          "The testimonial text. Markdown supported.",
        ),
        author: object("Author", {
          name: text("Name"),
          title: text("Title").optional(),
          company: object("Company", {
            name: text("Company name"),
          }),
        }),
        theme: select("Theme", ["light", "dark", "transparent"]),
        hasBorder: boolean("Show border"),
      }),
    ).hint(
      "Testimonial quotes. Each item has the quote, author, and an optional company.",
    ),
  },
});
