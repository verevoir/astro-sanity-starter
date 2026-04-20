# Add document types

The starter defines three block types: `page`, `siteConfig`, and `role-assignment`. Here's how to add your own.

## 1. Define the block

Create `src/schema/{name}.ts`:

```ts
import { defineBlock, text, richText, select } from "@verevoir/schema";
import { publishFields, tagsField } from "@verevoir/editor";

export const article = defineBlock({
  name: "article",
  fields: {
    title: text("Title").max(120),
    slug: text("Slug").hint("URL path, e.g. /blog/hello"),
    body: richText("Body"),
    category: select("Category", ["news", "tutorial", "opinion"]),
    ...publishFields(),
    ...tagsField(),
  },
});
```

Notes:

- `defineBlock` for any block. `defineContentBlock` auto-injects the shared metadata fields (`title`, `slug`, `metaTitle`, `metaDescription`, `addTitleSuffix`).
- `publishFields()` + `tagsField()` are editor-layer augmentation helpers — `status`, `publishFrom`, `publishTo`, `tags`. The admin picks up the datetime + tag controls automatically.
- `text`, `richText`, `number`, `boolean`, `select`, `reference`, `link`, `array`, `object` — the field primitives. See `@verevoir/schema`'s `llms.txt` for the full list.

## 2. Register with the admin

Edit `src/schema/registry.ts`:

```ts
import { article } from "./article";

export const blocks: BlockRegistry = {
  // ...existing entries
  article: {
    block: article,
    label: "Articles",
    category: "Content",   // groups in the sidebar
    preview: (data) => {
      const slug = data.slug as string | undefined;
      return slug ? `/blog${slug}` : undefined;
    },
  },
};
```

`preview(data)` returns the public URL to iframe alongside the editor. Omit for types without a public render (e.g. reusable components).

`singleton: true` on a block entry means "only one doc of this type allowed" — useful for things like `siteConfig`.

## 3. Render it on the public site

If the block has a public URL, add the route. For slug-driven types, extend your existing `[...slug].astro` handler to look up by `blockType` + `slug`. For fixed routes, create a dedicated `.astro` page.

A minimal article page at `src/pages/blog/[slug].astro`:

```astro
---
import Layout from "@/layouts/Layout.astro";
import { storage } from "@/storage";
import { isLive } from "@verevoir/editor";

export const prerender = false;

const { slug } = Astro.params;
const articles = await storage.list("article", {
  where: { slug: `/${slug}` },
});
const doc = articles[0];

if (!doc || !isLive(doc.data)) {
  return new Response("Not found", { status: 404 });
}

const data = doc.data as { title: string; body: string };
---

<Layout title={data.title}>
  <article set:html={data.body} />
</Layout>
```

`isLive(data)` checks `status === 'published'` AND the current time is within `publishFrom`/`publishTo`. Use it on any public render of a type that opts into `publishFields()`.

## 4. Seed a first doc (optional)

New block types start empty. If you want a placeholder, extend `src/data/init.ts`:

```ts
if ((await storage.list("article")).length === 0) {
  await storage.create("article", {
    title: "Welcome",
    slug: "/welcome",
    body: "# Hello",
    status: "published",
    tags: [],
  });
}
```

`ensureSeeded()` is called from the admin pages and public routes; one seed step runs on first boot.

## 5. Verify

- `npm run dev`
- Navigate to `/admin`
- Your new type appears in the sidebar under its `category`
- Click to see the list, **New {label}** to create, edit inline, save
- If you added a public route, view it at the slug you chose

## Polymorphic sections (like the page's sections array)

Polymorphic arrays — where each item is a different shape (hero, testimonials, CTA, etc.) — use a separate registry:

- Each section type is its own `defineBlock`
- Register in `src/schema/sections/index.ts` → `sectionDefinitions`
- Stored on the parent doc as `data.sections: Array<{ _type, ...fields }>`
- Edited via `@verevoir/admin`'s `SectionsEditor`, not the generic block editor

See `src/schema/sections/` for the existing set.

## When a field isn't enough

If the built-in field types don't cover what you need — a map picker, a colour swatch, an image cropper — you override the field component, not the schema:

```ts
import { BlockEditor } from "@verevoir/editor";

<BlockEditor
  block={article}
  value={data}
  onChange={setData}
  overrides={{
    coverImage: CustomImagePicker,   // by field name
    // or by ui hint: 'rich-text': MyMarkdownEditor
  }}
/>
```

The schema keeps the field as a plain string; the override is purely display. Storage doesn't know you replaced the editor.
