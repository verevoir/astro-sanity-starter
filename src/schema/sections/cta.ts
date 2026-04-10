import { defineBlock, text, richText, select } from "@verevoir/schema";

/**
 * Call-to-action section — heading + body + buttons. Smaller than
 * a hero. The `cta` array of action buttons/links is preserved on
 * save but not yet editable through the form.
 */
export const ctaSection = defineBlock({
  name: "ctaSection",
  fields: {
    heading: text("Heading")
      .max(120)
      .hint("The action you want the visitor to take."),
    body: richText("Body")
      .optional()
      .hint("One line of supporting copy."),
    theme: select("Theme", ["light", "dark"]).hint(
      "Switches the section background and text colour.",
    ),
    width: select("Width", ["full", "inset"]).hint(
      "`full` runs to the page edges. `inset` adds rounded corners and a max-width container.",
    ),
  },
});
