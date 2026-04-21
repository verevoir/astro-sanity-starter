# astro-sanity-starter (the Verevoir starter)

A working Astro marketing site with a content admin, composed from the `@verevoir/*` packages. Ships with seeded content, a dev auth flow, and a tag-based release-scheduling admin. Intended as the on-ramp for evaluating the Verevoir stack — clone, run, see something editable within a minute.

## What this starter is for

Two audiences:

1. **Humans** evaluating Verevoir — clone, run, see the admin work, understand the layering by poking around.
2. **Agent-assisted developers** — point Claude (or another agent) at the repo and ask it to extend the content model, theme the site, add a new block type, etc. The docs and this file are written to make that productive.

Not a production scaffold. See `docs/roadmap.md` for what's deliberately absent.

## Layering (load-bearing mental model)

```
┌──────────────────────────────────────────────┐
│  Starter app (this repo)                      │
│  - public site rendering                      │
│  - admin routes + islands                     │
│  - auth middleware + policy                   │
│  - storage instance                           │
├──────────────────────────────────────────────┤
│  @verevoir/admin  @verevoir/editor            │
│  - admin UI components, layouts, save handler │
│  - block editor, field components, helpers    │
├──────────────────────────────────────────────┤
│  @verevoir/access  @verevoir/schema           │
│  - identity + policy, no login flow           │
│  - content model definition, no UI            │
├──────────────────────────────────────────────┤
│  @verevoir/storage                            │
│  - persistence interface, pluggable adapter   │
└──────────────────────────────────────────────┘
```

Read bottom-up: **schema + storage = content lake** (structured persistence, no CMS). Add **editor** = CMS (auto-generated forms). Add **admin** = a shell around the editor. The starter composes them into an app.

Editor-layer "augmentation helpers" (`publishFields()`, `tagsField()`, `isLive()`) inject conventional fields into any block without requiring storage-level changes. New features of that shape belong here, not in `@verevoir/storage`.

## Where things live

| Path | What's in it |
|------|--------------|
| `src/schema/` | Block definitions (page, siteConfig, role-assignment) and section definitions |
| `src/schema/registry.ts` | The block registry the admin sidebar reads from — one entry per content type |
| `src/schema/sections/` | Polymorphic page sections (hero, cards, cta, testimonials, logos) |
| `src/storage.ts` | Single storage instance used everywhere (public render, admin, seed) |
| `src/blob-adapter.ts` + `src/blob-store.ts` | Filesystem-backed storage adapter; swap `store:` to change backend |
| `src/access/index.ts` | Auth adapter, role store, policy, `resolveIdentity(token)` — composes `@verevoir/access` |
| `src/middleware.ts` | Astro middleware: resolves identity, gates `/admin/*` and `/api/admin/*` |
| `src/seed.ts` | One-shot content seed — runs if storage is empty |
| `src/data/init.ts` | `ensureSeeded()` — called from every admin and public route |
| `src/data/page.ts` | Public-side data fetchers; filters by `isLive()` so drafts don't leak |
| `src/pages/[...slug].astro` | Public page router (static paths from live pages) |
| `src/pages/admin.astro` | Admin home — lists document groups |
| `src/pages/admin/[blockType]/[id].astro` | Document editor |
| `src/pages/admin/tags/` | Tag scheduler routes |
| `src/pages/admin/login.astro` + `src/pages/api/admin/login.ts` | Dev login form + cookie handler |
| `src/pages/api/admin/save.ts` | POST handler for document saves — includes access check |
| `src/pages/api/admin/bulk-publish.ts` | POST handler for tag-based bulk publish window updates |
| `src/admin/` | React islands wrapping `@verevoir/admin` layouts |
| `src/components/` | Public site section renderers (Hero, Cards, Testimonials, Cta, Logos) |
| `src/layouts/Layout.astro` | Public site shell |
| `src/styles/globals.css` | Tailwind + DaisyUI theme tokens |
| `src/styles/admin-theme.css` | Glass-theme overrides applied to the admin shell |
| `data/*.json` | Content storage (git-trackable JSON via FilesystemBlobStore) |
| `docs/` | Hand-written guides — start here for "how do I ..." questions |

## Where to read next

- `docs/README.md` — index of recipe docs (add Google auth, add document types, theme the site, port your data, etc.)
- `docs/authentication.md` — the v1 access flow
- `docs/roadmap.md` — what v1 deliberately isn't, forward path for each limitation
- The `@verevoir/*` packages have their own `CLAUDE.md` and `llms.txt` describing their internals when you drill deeper.

## Conventions worth knowing

- **Auth gates**: `/admin/*` and `/api/admin/*` are protected by middleware. Viewers authenticate but can't write; admins can do everything. See `src/access/index.ts` for the policy.
- **Publish resolution**: public-site routes filter by `isLive(data)` — a doc is live iff `status === 'published'` AND now falls between `publishFrom` and `publishTo` (either is optional). Do not skip this check on new public routes; drafts must not leak.
- **Schema augmentation pattern**: editor-layer features (publishing, tagging) are spread into block definitions via helpers (`...publishFields()`, `...tagsField()`). Storage stays shape-agnostic; resolution functions (`isLive`, `collectTags`, `filterByTag`) read those fields at runtime.
- **Seeding**: `ensureSeeded()` runs once at boot. The seed creates storage entries only if none exist — edits survive. To change what ships with a fresh clone, edit `src/seed.ts`.
- **Static vs hosted**: `npm run build:static` produces a tarball of public HTML only — admin is excluded. `npm run build` produces a hybrid with server-rendered admin routes (deploys to Netlify via the adapter). Both build from the same source.

## Commands

| Command | Does what |
|---------|-----------|
| `npm run dev` | Dev server on port 4321 |
| `npm run build` | Hybrid build (public + admin) |
| `npm run build:static` | Static tarball; admin is excluded |
| `npm run preview` | Serve the production build locally |
| `npm test` | Playwright smoke suite against the running dev server |
| `npm run test:ui` | Playwright UI mode |

## If you're Claude (or another agent)

Before making changes, ask yourself where the feature belongs in the layering above. A new "versioning" feature almost certainly belongs in the **editor layer** as an augmentation helper, not in `@verevoir/storage`. A new render treatment belongs in the starter's components, not in `@verevoir/admin`. A new UI control probably belongs in `@verevoir/editor`'s fields. Mis-placing features costs rework.

When the conventions above and the user's stated direction conflict, surface the conflict — don't quietly choose one. The user knows things about their intent that aren't in the docs.
