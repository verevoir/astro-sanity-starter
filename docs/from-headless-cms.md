# Moving from a paid headless CMS

This doc is for teams considering moving to Verevoir from a hosted headless CMS — Sanity, Contentful, Storyblok, Hygraph, Prismic, Builder.io, and the rest of that category. The products differ in studio UX, schema-authoring style, query language, and pricing detail, but they share the shape that the comparison below is about: hosted content backend, vendor-owned data, usage-tier pricing, studio-driven editing.

The critique here is of the shape, not of any individual vendor. Each of those products is well-built for the model it occupies — these are real businesses serving real customers well. The point is that the model has trade-offs that may or may not still suit you, and there's now a different shape on offer.

## What's structurally different

Things a hosted vendor can't change without dismantling its own business model:

| Dimension | Hosted headless CMSes | Verevoir |
|---|---|---|
| Runtime | Vendor-hosted backend + studio | `npm` packages in your app |
| Data ownership | Vendor holds the canonical copy | You hold the canonical copy |
| Database | Vendor's proprietary content store | Any — Postgres, SQLite, filesystem, S3, or an adapter back at your existing vendor |
| Pricing model | Usage-based: documents/records, bandwidth, API calls, user seats | Open-source `npm` packages. No runtime cost from Verevoir. |
| Admin UI | Vendor's studio, monolithic | `@verevoir/admin`, composable. Build your own shell if you want. |
| Adoption shape | Studio or bust — hard to use a slice | Pick one package. Schema alone is useful. Add editor for a CMS. Add admin for the full thing. |
| Lock-in surface | API + content shape + studio customisations | Zero — your code talks to a `StorageAdapter` interface, not a vendor SDK |

These are shape differences, not feature gaps. They're the things you trade in either direction.

## What you trade away by moving

Honest about what hosted CMSes do well that you'd lose or have to rebuild:

- **Operational simplicity.** They run it for you. That's literally what you pay for. Verevoir's `npm`-in-your-app shape means you operate the admin yourself (Netlify functions, your own server, whatever). For a small site this is trivial; for a multi-region high-availability authoring backend it's not.
- **Maturity of the studio experience.** A decade of studio polish — accessibility, keyboard shortcuts, deeply customisable input components, structure builders, preview renderers. `@verevoir/admin` is composable but newer; equivalent depth isn't all there yet.
- **Real-time collaboration.** Most hosted CMSes have it; Verevoir doesn't.
- **AI / LLM authoring tooling.** Hosted CMSes are investing here heavily. Verevoir has hooks (`@verevoir/editor`'s `CopyAssistProvider` — you supply the LLM, it surfaces a suggest button) but no first-class AI product surface yet.
- **Ecosystem maturity.** Big plugin ecosystems, lots of existing integrations, well-known patterns.
- **Hosted asset CDN with built-in transformations.** Verevoir composes this from `@verevoir/assets` + an imgproxy you run yourself, plus your own object store.

## What you gain

Where Verevoir's shape pays off:

- **Data in your database.** Use SQL, run analytics, integrate with your existing data warehouse, satisfy compliance audits that ask "where exactly does this content live".
- **No usage-tier surprises.** No pricing inflection at 10k records, no per-seat editor charge, no bandwidth tier. Open-source npm packages.
- **Composable adoption.** `@verevoir/schema` alone is useful as a TypeScript schema validator. Add `@verevoir/editor` when you want forms. Add `@verevoir/admin` when you want a shell. Each step is a real stop, not a teaser.
- **Versioning as a workflow primitive.** `publishFields()` adds `status` + `publishFrom` + `publishTo` to any block. `isLive(data)` resolves visibility at render time. Multiple versions of the same page can coexist with different publish windows; the renderer picks the live one automatically. The category typically treats versioning as audit/history rather than a workflow.
- **Tag-based release scheduling.** `tagsField()` + the admin tag scheduler lets you bulk-set publish windows across tagged pages — useful for coordinated multi-page launches. Tags are orthogonal to versions, so a version can be in multiple tags and tags can carry their own metadata.
- **Adjacent packages, no glue.** `@verevoir/commerce` + `@verevoir/stripe` + `@verevoir/bookings` + `@verevoir/access` + `@verevoir/qr` + `@verevoir/link-tracking` are first-party. Hosted CMSes leave commerce, bookings, and auth to integration partners — different vendor relationship per concern.
- **Zero migration cliff.** The `StorageAdapter` interface lets you swap backends — start on filesystem, move to Postgres when you grow, drop in a managed Postgres when you grow more. The schema and the rest of the app don't change.

## Can I keep my current CMS during migration?

Yes. The intended pattern uses an **adapter** that satisfies Verevoir's `StorageAdapter` interface. For each major hosted CMS the adapter is roughly the same shape: `list()` / `get()` translate to the vendor's query API, mutations to the vendor's content management API. The published vendor adapters are around ~100 lines each.

With an adapter in place:

1. **Drop in Verevoir, keep the existing CMS as the storage.** `storage = new VendorAdapter({...})`. Schema, editor, admin — everything else renders content that still lives in the existing dataset. The vendor's studio continues to work for authoring if you keep using it.
2. **You get Verevoir's commerce, bookings, access, QR, link-tracking on top** without migrating any content.
3. **When ready, add a second storage adapter** (Postgres, filesystem, whatever). Migrate content incrementally. A/B the read path.
4. **Cut over.** Drop the vendor adapter when you're confident.

This sequence — adapter → dual-write → cutover — avoids the big-bang migration that usually kills these moves. It also works as an indefinite "wear Verevoir as a coat" mode if you genuinely like your current studio's authoring experience but want Verevoir's libraries underneath.

## Where common concepts map

| Hosted CMS concept | Verevoir |
|---|---|
| Schema type / Content type | `defineBlock` / `defineContentBlock` with typed fields |
| Studio's structured query (GROQ, GraphQL, REST) | `storage.list(blockType, { where, orderBy, limit })` + application code |
| Studio | `@verevoir/admin` + a thin Astro/Next/Remix host |
| Block content (Portable Text, Rich Text JSON, similar) | `richText()` storing markdown/HTML by default |
| References / Links | `reference(label, targetBlockType)` — UUID pointer |
| Image assets / asset library | `@verevoir/assets` + `@verevoir/media` (imgproxy-backed resize URLs) |
| Releases / Scheduled publish | Tags + `TagScheduler` (richer: tags are orthogonal, can overlap) |
| Document history | Versioning via multiple docs sharing a slug with different `publishFrom`/`publishTo` |
| Studio hosting | Netlify / Vercel / anywhere that runs Node |
| Roles & permissions | `@verevoir/access` policy + role-store (env-bootstrapped admin, in-app role assignments) |

## The impedance mismatches

Honest about what doesn't translate cleanly:

1. **Versioning semantics.** Verevoir's model is that "validity → publish" — if a valid version exists with `status: published`, it's live. Most hosted CMSes use draft + published with manual transitions. Running Verevoir on the vendor's storage via an adapter degrades to single-version semantics (one live version at a time). The richer model unlocks when you migrate to your own storage.

2. **Rich text formats.** Verevoir's `richText()` stores a string (markdown or HTML by default). Most hosted CMSes use structured rich-text formats with their own conventions for embedded references, marks, and custom blocks. If your content relies on those structures, you either write a custom rich-text field with that storage shape, or convert on migration — lossy for embedded references.

3. **Studio customisations.** If you've invested heavily in custom input components, structure builders, or preview renderers in your current studio, those don't port directly. The `@verevoir/admin` field-override pattern is a similar escape hatch, but the API surfaces differ.

4. **Real-time collaboration.** No equivalent in Verevoir today.

## When NOT to move

- You rely heavily on the vendor's AI tooling today — wait until parity exists, or fill the gap with your own `CopyAssistProvider`.
- Your team is small and the CMS bill is a rounding error. The migration work doesn't pay back at low usage.
- You love the vendor's authoring UX and your authors are vendor-fluent. Verevoir's admin is functional but different — retraining costs are real.
- You don't want to operate anything. Running your own admin (even via Netlify functions) is a step up in operational responsibility from "they run it".

## When TO move

- You're facing a usage-tier jump that hurts.
- You want the data in your database for analytics, search, custom queries, or compliance.
- You want commerce / bookings / access / QR alongside content without stitching five SaaS products together.
- You want content to live next to code in the same deploy pipeline.
- You're building a platform where your users need their own content — hosted-per-user economics break the SaaS-CMS model fast.
- You want insulation from the next acquisition / pricing change / sunset cycle that hosted vendors periodically go through.

## Related

- [port-your-data.md](port-your-data.md) — the technical side of migrating: adapter code, rich-text conversion strategies, asset re-upload.
- [authentication.md](authentication.md) — the access model if you're going to run your own admin.
- [roadmap.md](roadmap.md) — what the Verevoir starter deliberately doesn't cover in v1.
