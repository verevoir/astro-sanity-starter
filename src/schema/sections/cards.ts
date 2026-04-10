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
 * Cards section — grid of feature cards. The `items` array is now
 * editable: the dispatcher routes it to CardGridArrayField because
 * each card has a nested `badge` object.
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
    items: array(
      "Cards",
      object("Card", {
        heading: text("Heading").hint(
          "Card title — 1-3 words is best.",
        ),
        body: richText("Body").hint(
          "Markdown supported. Keep to 1-3 sentences.",
        ),
        badge: object("Badge", {
          label: text("Label").hint("Short uppercase label."),
          theme: select("Theme", ["primary", "secondary", "accent", "neutral"]),
        }),
        theme: select("Theme", ["light", "dark", "transparent"]).hint(
          "Per-card theme override.",
        ),
        textAlign: select("Text alignment", ["left", "center"]),
        hasBorder: boolean("Show border"),
      }),
    ).hint(
      "Feature cards shown in the grid. Reorder with the arrow buttons.",
    ),
  },
});
