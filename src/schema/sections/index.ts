import type { BlockDefinition, FieldRecord } from '@verevoir/schema';
import { heroSection } from './hero';
import { cardsSection } from './cards';
import { ctaSection } from './cta';
import { logosSection } from './logos';
import { testimonialsSection } from './testimonials';

export interface SectionDefinition {
    /** Type discriminator stored in `data._type` on each section */
    type: string;
    /** Human-readable label shown in the section picker */
    label: string;
    /** Verevoir block definition for this section type */
    block: BlockDefinition<FieldRecord>;
    /** Glyph shown beside the type label in the admin's section list and picker */
    iconSrc?: string;
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
    {
        type: 'heroSection',
        label: 'Hero',
        block: heroSection,
        iconSrc: '/images/content-icons/hero.svg'
    },
    {
        type: 'cardsSection',
        label: 'Cards grid',
        block: cardsSection,
        iconSrc: '/images/content-icons/feature-cards.svg'
    },
    {
        type: 'ctaSection',
        label: 'Call to action',
        block: ctaSection,
        iconSrc: '/images/content-icons/call-to-action.svg'
    },
    {
        type: 'logosSection',
        label: 'Logo strip',
        block: logosSection,
        iconSrc: '/images/content-icons/icons.svg'
    },
    {
        type: 'testimonialsSection',
        label: 'Testimonials',
        block: testimonialsSection,
        iconSrc: '/images/content-icons/testimonials.svg'
    }
];

/** Look up a section definition by its type discriminator */
export function getSectionDefinition(type: string): SectionDefinition | undefined {
    return sectionDefinitions.find((d) => d.type === type);
}

export { heroSection, cardsSection, ctaSection, logosSection, testimonialsSection };
