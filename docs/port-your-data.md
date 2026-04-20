# Port your data

The starter's storage is pluggable — `@verevoir/storage`'s `StorageAdapter` is a stable interface with several implementations available. Here's how to migrate content *in*, *out*, or *across*.

> Status: most migration paths are recipe-level — real-world content tends to need its own shape mapping. These notes give you the primitives; the bespoke part is the per-field mapping.

## The shape of a migration

Every content migration is:

1. **Read** from the source (a file export, an API, another storage adapter).
2. **Map** each source document to the target block's field shape.
3. **Write** via `storage.create()` or `storage.update()`.
4. **Verify** with a small script that lists the target and spot-checks.

Steps 1, 3, 4 are always the same. Step 2 is the work.

## Adapters at a glance

| Adapter | Where | When to use |
|---|---|---|
| `BlobAdapter` + `FilesystemBlobStore` | `./data/*.json` | Local dev, small sites, git-tracked content |
| `BlobAdapter` + `GcsBlobStore` / `S3BlobStore` | Cloud object storage | Hosted sites, shared editing without a database |
| `PostgresAdapter` | Postgres | When you want queryable content and a real database |
| `SanityAdapter` | Sanity Studio dataset | Mid-migration state; read from Sanity, write to your own storage |

The starter uses the filesystem variant. Swap it in `src/storage.ts` — nothing else needs to change.

## Import from Sanity

```ts
import { SanityAdapter } from "@verevoir/storage/sanity";
import { storage } from "@/storage"; // target

const source = new SanityAdapter({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  token: process.env.SANITY_READ_TOKEN!,
});

async function migratePages() {
  const sanityPages = await source.list("page");
  for (const doc of sanityPages) {
    const mapped = {
      title: doc.data.title,
      slug: doc.data.slug?.current ?? "/",
      body: doc.data.body?.map(blockToMarkdown).join("\n\n") ?? "",
      status: doc.data._draft ? "draft" : "published",
      tags: [],
    };
    await storage.create("page", mapped);
  }
}
```

Sanity-specific things the mapping handles:

- **Slug objects.** Sanity stores `{ _type: 'slug', current: '/path' }`. We flatten to the string.
- **Portable Text.** Sanity's block array needs converting to markdown / HTML. Write a `blockToMarkdown` helper.
- **References.** Sanity refs are `{ _ref: '<id>' }`. Resolve to the target doc's slug or id depending on your model.
- **Assets.** Sanity hosts images with a CDN URL. Either keep them on Sanity (simplest) or download and re-upload to your asset storage.

## Import from Markdown / MDX

If you're coming from a static-site generator (Astro content collections, Next's `content/`, Hugo), the data is already on disk:

```ts
import { readdir, readFile } from "node:fs/promises";
import matter from "gray-matter";

for (const filename of await readdir("./legacy-content")) {
  const raw = await readFile(`./legacy-content/${filename}`, "utf-8");
  const { data, content } = matter(raw);
  await storage.create("page", {
    title: data.title,
    slug: data.slug ?? `/${filename.replace(/\.mdx?$/, "")}`,
    body: content,
    status: data.draft ? "draft" : "published",
    tags: data.tags ?? [],
  });
}
```

## Export for backup / archive

`storage.list(blockType)` gets everything. `JSON.stringify` and you're done:

```ts
import { writeFile } from "node:fs/promises";
import { storage } from "@/storage";

const blockTypes = ["page", "siteConfig", "role-assignment"];
for (const type of blockTypes) {
  const docs = await storage.list(type);
  await writeFile(`./backup/${type}.json`, JSON.stringify(docs, null, 2));
}
```

Or just commit `./data/*.json` if you're on the filesystem adapter — the backup is already there.

## Swap storage backends

The `StorageAdapter` interface is the contract. Switch adapters without touching the schema, admin, or pages:

```ts
// src/storage.ts
import { PostgresAdapter } from "@verevoir/storage/postgres";

export const storage = new PostgresAdapter({
  connectionString: import.meta.env.DATABASE_URL,
});
```

Before flipping production, run a migration that reads from the old adapter and writes to the new — same pattern as the Sanity import. Spot-check a handful of docs. Point the app at the new adapter.

## Gotchas

- **IDs don't always transfer.** Sanity ids, Postgres uuids, and filesystem slugs don't line up. Don't assume the id you're reading from the source is the id you want on the target — let the target adapter generate.
- **Reference migrations are two-pass.** First pass: create all docs, remembering `sourceId → targetId`. Second pass: walk each doc's refs and remap. One pass and you'll write refs pointing at ids that don't exist yet.
- **Validation on write.** The storage adapter doesn't run your schema's `validate()`. If you're migrating messy data, map + validate explicitly: `entry.block.validate(mapped)` before `storage.create`. Surface the failures rather than persisting garbage.
- **Assets are a separate problem.** Content docs ≠ binary assets. If you're migrating images, videos, or files, you need a plan for the asset storage too — `@verevoir/assets` + a `BlobStore` for the binaries.
