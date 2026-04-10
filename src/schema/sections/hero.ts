import { defineBlock, text, richText, select } from "@verevoir/schema";

/**
 * Hero section — large heading + body + (optional) call-to-action.
 *
 * The `cta` array of action buttons/links is preserved across saves
 * but not yet editable through the auto-generated form. Edit the
 * underlying JSON in `data/page.json` for now.
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
  },
});
