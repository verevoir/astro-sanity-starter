import { defineBlock, text, richText, select, array, object } from "@verevoir/schema";

/**
 * Hero section — large heading + body + (optional) call-to-action.
 *
 * The cta array is rendered as an editable table in the admin —
 * one row per action, columns for type / label / url / theme.
 */
export const heroSection = defineBlock({
  name: "heroSection",
  fields: {
    heading: text("Heading")
      .max(120)
      .hint("Short, punchy. The first thing visitors read."),
    body: richText("Body").hint(
      "Markdown supported. Keep to 1-2 sentences for impact.",
    ),
    theme: select("Theme", ["light", "dark"]).hint(
      "Switches the section background and text colour.",
    ),
    width: select("Width", ["full", "inset"]).hint(
      "`full` runs to the page edges. `inset` adds rounded corners and a max-width container.",
    ),
    cta: array(
      "Calls to action",
      object("Action", {
        _type: select("Style", ["actionButton", "actionLink"]).hint(
          "`actionButton` renders as a filled button. `actionLink` renders as inline text.",
        ),
        label: text("Label").hint("The visible text on the button or link."),
        url: text("URL").hint(
          "Full URL (https://…) for external destinations, or a slug (`/about`) for internal pages.",
        ),
        theme: select("Theme", ["primary", "secondary", "accent", "neutral"])
          .optional()
          .hint("Button colour. Only applies when style is actionButton."),
      }),
    ).hint(
      "Buttons and links shown beneath the body. Add as many as you need; reorder with the arrow buttons.",
    ),
  },
});
