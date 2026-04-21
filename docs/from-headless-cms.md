# Moving from Sanity to Verevoir

If you're considering moving a Sanity project to Verevoir, this doc explains what's the same, what's different, what you gain, what you lose, and how to migrate without a rewrite. Honest throughout — the goal here isn't to oversell.

## What's structurally different

The things Sanity can't copy without dismantling its own company:

| Dimension | Sanity | Verevoir |
|---|---|---|
| Runtime | Hosted Content Lake + Studio | `npm` packages in your app |
| Data ownership | Sanity holds the canonical copy | You hold the canonical copy |
| Database | Content Lake only | Any — Postgres, SQLite, filesystem, S3, or a `SanityAdapter` pointed back at a Sanity dataset |
| Pricing model | Usage-based tiers, documents, bandwidth, user seats | Open-source `npm` packages. No runtime cost from Verevoir. |
| Admin UI | Sanity Studio, monolithic | `@verevoir/admin`, composable. Ship your own shell if you want. |
| Adoption shape | Studio or bust — hard to use a slice | Pick one package. Schema alone is useful. Add editor for a CMS. Add admin for the full thing. |

None of these are feature-level — they're shape-level. A vendor can't copy "owning your data" without ceasing to be a vendor.

## What's feature-level (and honest about gaps)

Where Sanity is ahead and it's worth knowing:

- **AI / LLM features.** Sanity is pushing hard on MCP, Content Agent, AI-assisted structure. Verevoir has hooks (`@verevoir/editor`'s `CopyAssistProvider` — you supply the LLM, it surfaces a suggest button) but no first-class AI product surface. This is a real gap. AI is feature-level, so it's catchable; it's not structural.
- **Collaborative editing.** Sanity has real-time co-editing. Verevoir doesn't.
- **Ecosystem maturity.** A decade of production use, a big plugin ecosystem, a lot of existing integrations. Verevoir is newer.
- **Hosted reliability.** Sanity runs it for you; that's also the thing you pay for. If you don't want to run anything, Verevoir's `npm`-in-your-app shape is more work, not less.

Where Verevoir wins on substance (not just posture):

- **Versioning as a workflow.** `publishFields()` adds `status` + `publishFrom` + `publishTo` to any block. `isLive(data)` resolves visibility at render time. Multiple versions of the same page can live side-by-side with different publish windows; the renderer picks the live one automatically. Sanity has document history — that's an audit tool, not a content workflow.
- **Tag-based release grouping.** `tagsField()` + the admin tag scheduler lets you bulk-set publish windows across tagged pages. Sanity's "releases" feature is a container-based version that's more limited — in Verevoir, tags are orthogonal to versions, so a version can be in multiple tags, and tags can carry any metadata.
- **Composable adoption.** Use `@verevoir/schema` alone to validate JSON in your existing app. Add `@verevoir/editor` when you want forms. Add `@verevoir/admin` when you want the full shell. Every step is a real stop, not a teaser.
- **Zero vendor lock-in on the data.** The storage adapter interface means you can swap Postgres for Filesystem for S3 without touching content models. That's the moat you didn't realise you wanted until your hosted provider raised prices.

## Can I stay on Sanity during migration?

Yes. The intended path uses a `SanityAdapter` that satisfies Verevoir's `StorageAdapter` interface — `list()` / `get()` become GROQ queries, mutations become the Sanity mutation API. About 100 lines of adapter code.

With that in place:

1. **Drop in Verevoir, keep Sanity as the storage.** `storage = new SanityAdapter({...})`. Everything else — schema, editor, admin — renders content that still lives in your Sanity dataset. Sanity Studio continues to authorise.
2. **You get Verevoir's commerce, bookings, access, QR, link-tracking on top** without migrating any content.
3. **When ready, add a second storage adapter** (Postgres, filesystem, whatever). Migrate content incrementally. A/B the read path.
4. **Cut over.** Drop the `SanityAdapter`.

This sequence — adapter → dual-write → cutover — avoids the big-bang migration that usually kills these moves.

## Where Sanity concepts map

| Sanity | Verevoir |
|---|---|
| Schema type | `defineBlock` / `defineContentBlock` with typed fields |
| GROQ query | `storage.list(blockType, { where, orderBy, limit })` + application code |
| Studio | `@verevoir/admin` + a thin Astro/Next/Remix host |
| Block content (Portable Text) | `richText()` storing markdown/HTML (no portable text yet; you'd keep Sanity's if migrating) |
| References | `reference(label, targetBlockType)` — UUID pointer |
| Image assets | `@verevoir/assets` + `@verevoir/media` (imgproxy-backed resize URLs) |
| Releases | Tags + `TagScheduler` (richer: tags are orthogonal, can overlap) |
| Document history | Versioning via multiple docs sharing a slug with different `publishFrom`/`publishTo` |
| Studio hosting | Netlify / Vercel / anywhere that runs Node |

## The impedance mismatches

Honest about what doesn't translate cleanly:

1. **Versioning semantics.** Verevoir's model is that "validity → publish" — if a valid version exists with `status: published`, it's live. Sanity's model is draft + published, manual transitions. If you run Verevoir on Sanity storage via the adapter, you'd degrade to single-version semantics (one live version at a time). You unlock the richer model by migrating off Sanity storage.

2. **Portable Text.** Verevoir's `richText()` stores a string (markdown or HTML by default). Sanity's Portable Text is a structured document. If your content relies on Portable Text, you either write a custom rich-text field with Portable Text storage, or convert on migration — lossy for embedded references.

3. **Studio customisations.** Sanity Studio's customisation is deep — custom input components, preview renderers, structure builder. `@verevoir/admin` is composable but newer; equivalent depth isn't all there yet.

## When NOT to move

- You rely heavily on Sanity's AI tooling today — wait or fill the gap yourself.
- Your team is small and the Sanity bill is the least of your costs. The migration work doesn't pay back.
- You love Sanity Studio's authoring UX and your authors are Sanity-fluent. Verevoir's admin is functional but different.

## When TO move

- You're facing a usage-tier jump that hurts.
- You want the data in your database for analytics, search, custom queries, or compliance.
- You want to add commerce / bookings / access / QR without stitching five SaaS products together.
- You want content to live next to code in the same deploy pipeline.
- You're building a platform where your users need their own content — hosted-per-user economics break Sanity's model fast.

## Related

- [port-your-data.md](port-your-data.md) — the technical side of migrating: adapter code, Portable Text conversion strategies, asset re-upload.
- [authentication.md](authentication.md) — the access model if you're going to run your own admin.
- [roadmap.md](roadmap.md) — what the Verevoir starter deliberately doesn't cover in v1.
