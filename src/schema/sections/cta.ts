import { defineBlock, text, richText, array, object, link } from '@verevoir/schema';

/**
 * Call-to-action section — heading + body + buttons. Smaller than
 * a hero. The cta array is rendered as an editable table in the
 * admin.
 */
export const ctaSection = defineBlock({
    name: 'ctaSection',
    fields: {
        heading: text('Heading').max(120).hint('The action you want the visitor to take.'),
        body: richText('Body').optional().hint('One line of supporting copy.'),
        cta: array(
            'Calls to action',
            object('Action', {
                label: text('Label').hint('The visible text on the button.'),
                url: link('URL').hint('Full URL (https://…) for external destinations, or a slug (`/about`) for internal pages.')
            })
        ).hint('Buttons shown beneath the body. Add as many as you need; reorder with the arrow buttons or drag handle.')
    }
});
