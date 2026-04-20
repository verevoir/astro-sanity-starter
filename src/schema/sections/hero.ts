import { defineBlock, text, richText, array, object, link } from '@verevoir/schema';

/**
 * Hero section — large heading + body + (optional) call-to-action.
 *
 * The cta array renders as a list in the admin — one row per
 * action with label and URL.
 */
export const heroSection = defineBlock({
    name: 'heroSection',
    fields: {
        heading: text('Heading').max(120).hint('Short, punchy. The first thing visitors read.'),
        body: richText('Body').hint('Markdown supported. Keep to 1-2 sentences for impact.'),
        cta: array(
            'Calls to action',
            object('Action', {
                label: text('Label').hint('The visible text on the button.'),
                url: link('URL').hint('Full URL (https://…) for external destinations, or a slug (`/about`) for internal pages.')
            })
        ).hint('Buttons shown beneath the body. Add as many as you need; reorder with the arrow buttons or drag handle.')
    }
});
