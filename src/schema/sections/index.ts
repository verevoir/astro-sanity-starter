import type { BlockDefinition, FieldRecord } from "@verevoir/schema";
import { heroSection } from "./hero";
import { cardsSection } from "./cards";
import { ctaSection } from "./cta";
import { logosSection } from "./logos";
import { testimonialsSection } from "./testimonials";

export interface SectionDefinition {
  /** Type discriminator stored in `data._type` on each section */
  type: string;
  /** Human-readable label shown in the section picker */
  label: string;
  /** Verevoir block definition for this section type */
  block: BlockDefinition<FieldRecord>;
}

/**
 * Registry of all section types available to the page editor.
 * To add a new section type:
 * 1. Define a block in `src/schema/sections/your-section.ts`
 * 2. Add an entry below
 * 3. Add a corresponding Astro renderer in `src/components/`
 * 4. Wire it into the componentMap in `src/pages/[...slug].astro`
 */
export const sectionDefinitions: SectionDefinition[] = [
  { type: "heroSection", label: "Hero", block: heroSection },
  { type: "cardsSection", label: "Cards grid", block: cardsSection },
  { type: "ctaSection", label: "Call to action", block: ctaSection },
  { type: "logosSection", label: "Logo strip", block: logosSection },
  {
    type: "testimonialsSection",
    label: "Testimonials",
    block: testimonialsSection,
  },
];

/** Look up a section definition by its type discriminator */
export function getSectionDefinition(
  type: string,
): SectionDefinition | undefined {
  return sectionDefinitions.find((d) => d.type === type);
}

export {
  heroSection,
  cardsSection,
  ctaSection,
  logosSection,
  testimonialsSection,
};
