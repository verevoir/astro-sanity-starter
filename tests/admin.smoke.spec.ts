import { test, expect } from '@playwright/test';

/**
 * Admin smoke tests — focused on bug classes we've actually hit
 * rather than exhaustive coverage.
 *
 * The big one: a Zod 4 schema serialised through Astro's
 * `client:only` JSON-roundtrip loses its non-enumerable `_zod`
 * namespace. Any field component that introspects the schema via
 * `schema._zod?.def` silently breaks — most visibly, SelectField
 * renders zero options. The columns dropdown assertion below
 * would have caught that on the day we shipped it.
 */

// The starter gates /admin/* behind auth. For smoke tests we log
// in as the dev admin before each test via a direct POST to the
// login endpoint, then let the shared cookie jar carry the session.
test.beforeEach(async ({ page, request }) => {
  const response = await request.post('/api/admin/login', {
    form: { token: 'admin-token', returnTo: '/admin' },
    maxRedirects: 0,
    failOnStatusCode: false,
    headers: { Origin: 'http://localhost:4321' },
  });
  expect(response.status()).toBe(302);
  // Carry the cookie across to the browser context so page.goto sees
  // an authenticated session.
  const cookies = await request.storageState();
  await page.context().addCookies(cookies.cookies);
});

test.describe('Admin home', () => {
  test('lists registered block types', async ({ page }) => {
    await page.goto('/admin');
    // Sidebar renders categories (h3) and type labels under each.
    await expect(page.getByRole('heading', { name: 'Content' })).toBeVisible();
    await expect(page.locator('[data-admin-sidebar-type-label]', { hasText: 'Pages' })).toBeVisible();
  });
});

test.describe('Page editor', () => {
  test.beforeEach(async ({ page }) => {
    // Go straight to the page editor by finding the seeded page id
    // from data/page.json (stable in the starter) — more robust than
    // driving the sidebar, which is a client:only island and flakes
    // under the slower post-auth hydration path.
    const fs = await import('node:fs/promises');
    const raw = await fs.readFile('./data/page.json', 'utf-8');
    const docs: Array<{ id: string; blockType: string }> = JSON.parse(raw);
    const home = docs.find((d) => d.blockType === 'page');
    if (!home) throw new Error('No seeded page doc found');
    await page.goto(`/admin/page/${home.id}`);
    await expect(page).toHaveURL(/\/admin\/page\//);
  });

  test('cards columns dropdown lists one/two/three', async ({ page }) => {
    // Originally written against the testimonials section (which had a
    // 1-4 columns enum). Testimonials was dropped from the seed when
    // the home page moved to a benefits-only model — same regression
    // shape (Astro `client:only` schema serialisation) is now guarded
    // by the cards section's columns dropdown, which has 1-3 enum
    // values. Either reproduces the bug if it returns.
    await page
      .locator('[data-sections-item-toggle]')
      .filter({ hasText: 'Cards grid' })
      .first()
      .click();
    const openBody = page.locator(
      '[data-sections-item][data-sections-item-open="true"]',
    );
    const columnsSelect = openBody
      .locator('fieldset', {
        has: page.locator('legend', { hasText: 'Columns' }),
      })
      .locator('select');
    await expect(columnsSelect).toBeVisible();
    const optionValues = await columnsSelect
      .locator('option')
      .evaluateAll((opts) =>
        opts.map((o) => (o as HTMLOptionElement).value),
      );
    expect(optionValues).toEqual(
      expect.arrayContaining(['one', 'two', 'three']),
    );
  });

  test('hero CTA list rows clip rather than overflow column', async ({ page }) => {
    // The CTA list inside the hero section uses TableArrayField (the
    // list+modal pattern with `[data-list-array]`). Original failure
    // mode (already fixed): fieldset's default `min-width: min-content`
    // let long item content push the list past the editor column,
    // hiding the up/down controls. Hero's CTA array is the seeded
    // example of a TableArrayField in the home page; if that breaks
    // again, this test fails fast.
    await page
      .locator('[data-sections-item-toggle]')
      .filter({ hasText: 'Hero' })
      .first()
      .click();
    const fieldset = page.locator('fieldset', {
      has: page.locator('legend', { hasText: /Calls to action/i }),
    });
    const list = fieldset.locator('[data-list-array]');
    await expect(list).toBeVisible();
    const [fieldsetBox, listBox] = await Promise.all([
      fieldset.boundingBox(),
      list.boundingBox(),
    ]);
    expect(fieldsetBox).not.toBeNull();
    expect(listBox).not.toBeNull();
    expect(listBox!.width).toBeLessThanOrEqual(fieldsetBox!.width + 2);
  });
});
