import { createVersionStore } from '@verevoir/editor/version-store';
import type { VersionStoreStorage } from '@verevoir/editor/version-store';
import { storage } from '@/storage';

/**
 * Page-versions store for the starter.
 *
 * The version store treats `slug + status + version + updatedAt` as
 * reserved fields on every page document; the rest is the content.
 * Slinqi uses the same store on the same shape — see
 * `qr-links-service/src/server/content.ts` for the parallel.
 *
 * Public-side reads still go through `src/data/page.ts` which uses
 * `isLive(data)` directly — so a `status: published` doc with a
 * future `publishFrom` won't show up on the site even though
 * `getPublishedBySlug` returns it.
 */
interface PageContent extends Record<string, unknown> {
  title: string;
  slug: string;
}

export const pageVersionStore = createVersionStore<PageContent>({
  storage: storage as unknown as VersionStoreStorage,
  blockType: 'page',
});
