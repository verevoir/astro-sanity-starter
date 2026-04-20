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
    await page.goto('/admin');
    // Click into the seeded Home page. Use the link inside the
    // document list so we don't depend on the URL — the seeded
    // ID could change without breaking the test.
    await page.getByRole('link', { name: /home/i }).first().click();
    await expect(page).toHaveURL(/\/admin\/page\//);
  });

  test('testimonials columns dropdown lists 1-4', async ({ page }) => {
    // Switch to the Sections tab and open the testimonials section.
    await page.getByRole('button', { name: /testimonials/i }).first().click();
    // The columns select for the testimonials block — labelled
    // "Columns" via the field shell legend.
    const columnsSelect = page
      .locator('fieldset', { has: page.locator('legend', { hasText: 'Columns' }) })
      .locator('select');
    await expect(columnsSelect).toBeVisible();
    const optionValues = await columnsSelect.locator('option').evaluateAll(
      (opts) => opts.map((o) => (o as HTMLOptionElement).value),
    );
    // Includes the placeholder ('') plus the four enum values.
    expect(optionValues).toEqual(
      expect.arrayContaining(['one', 'two', 'three', 'four']),
    );
  });

  test('testimonials list rows clip rather than overflow column', async ({ page }) => {
    await page.getByRole('button', { name: /testimonials/i }).first().click();
    // The list lives inside a fieldset labelled "Testimonials".
    // Its <ol data-list-array> should not be wider than the
    // fieldset that contains it. Failure mode (the bug we just
    // fixed): fieldset's default `min-width: min-content` lets a
    // long unbroken testimonial quote push the list past the
    // editor column, hiding the up/down controls.
    const fieldset = page.locator('fieldset', {
      has: page.locator('legend', { hasText: 'Testimonials' }),
    });
    const list = fieldset.locator('[data-list-array]');
    await expect(list).toBeVisible();
    const [fieldsetBox, listBox] = await Promise.all([
      fieldset.boundingBox(),
      list.boundingBox(),
    ]);
    expect(fieldsetBox).not.toBeNull();
    expect(listBox).not.toBeNull();
    // Allow a 2px slop for sub-pixel rounding.
    expect(listBox!.width).toBeLessThanOrEqual(fieldsetBox!.width + 2);
  });
});
