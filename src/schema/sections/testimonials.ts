import {
  defineBlock,
  text,
  richText,
  select,
  array,
  object,
} from "@verevoir/schema";

/**
 * Testimonials section — quote cards from customers/partners.
 * Items render as a list + modal in the admin (drag handle, stacked
 * up/down, click to edit).
 */
export const testimonialsSection = defineBlock({
  name: "testimonialsSection",
  fields: {
    heading: text("Heading")
      .max(120)
      .hint("Section title. e.g. 'What our customers say'."),
    body: richText("Body").optional(),
    columns: select("Columns", ["one", "two", "three", "four"]).hint(
      "How many testimonials per row on desktop.",
    ),
    items: array(
      "Testimonials",
      object("Testimonial", {
        quote: richText("Quote").hint(
          "The testimonial text. Markdown supported.",
        ),
        authorName: text("Author").hint(
          "Person being quoted (e.g. 'Jane Doe').",
        ),
        authorTitle: text("Title")
          .optional()
          .hint("Their role (e.g. 'Head of Marketing')."),
        company: text("Company")
          .optional()
          .hint("Where they work."),
      }),
    )
      .display("table")
      .hint(
        "Testimonial quotes. Each item has the quote, author, optional title, and company.",
      ),
  },
});
