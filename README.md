# Astro + Verevoir Starter

A working marketing site with a content admin, composed from the `@verevoir/*` packages. Clone, run, edit — you should see your first change live in the browser inside five minutes.

No hosted backend, no API keys, no vendor lock-in. The database is a folder of JSON files until you decide otherwise.

## Quick start

```bash
git clone <this-repo>
cd astro-sanity-starter
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) — that's the public site.
Open [http://localhost:4321/admin](http://localhost:4321/admin) — that's the content admin.

The dev login picker has two identities: `admin@local` (full control) and `viewer@local` (read-only). Pick admin, edit the home page's heading, save, reload the public site. First achievement unlocked.

## What ships with it

A marketing site with composable sections, all editable through the admin:

- **Hero** — heading, markdown body, CTA buttons
- **Cards** — grid of feature cards with badges and links
- **Logos** — animated logo strip
- **Testimonials** — quote cards
- **CTA** — call-to-action with buttons

Plus the admin itself:

- Document editor driven by `@verevoir/editor` — auto-generated forms from your schema
- Section editor with drag-and-drop reordering, live preview iframe
- Tag-based release scheduling — tag versions, bulk-set their publish window, let the existing `publishFrom`/`publishTo` machinery handle activation
- Two-tier auth (admin / viewer) with a close-the-backdoor seeding flow
- Glass theme out of the box

### Tech stack

- [Astro 6](https://astro.build) — hybrid static + server
- [@astrojs/netlify](https://docs.netlify.com/integrations/frameworks/astro/) — adapter for the admin functions
- [@astrojs/react](https://docs.astro.build/en/guides/integrations-guide/react/) — admin islands
- [Tailwind CSS 4](https://tailwindcss.com) + [DaisyUI 5](https://daisyui.com) — public site styling
- [@verevoir/schema](https://www.npmjs.com/package/@verevoir/schema) — content models (zod 4 under the hood)
- [@verevoir/storage](https://www.npmjs.com/package/@verevoir/storage) — persistence interface
- [@verevoir/editor](https://www.npmjs.com/package/@verevoir/editor) — field components + schema augmentation helpers
- [@verevoir/admin](https://www.npmjs.com/package/@verevoir/admin) — admin shell, sections editor, tag scheduler
- [@verevoir/access](https://www.npmjs.com/package/@verevoir/access) — identity + policy

## How it fits together

```
┌──────────────────────────────────────────────┐
│  This starter                                 │
│  public site • admin routes • auth middleware │
├──────────────────────────────────────────────┤
│  @verevoir/admin       @verevoir/editor       │
│  admin UI              field components       │
├──────────────────────────────────────────────┤
│  @verevoir/access      @verevoir/schema       │
│  identity + policy     content model          │
├──────────────────────────────────────────────┤
│  @verevoir/storage                            │
│  persistence adapter                          │
└──────────────────────────────────────────────┘
```

Bottom-up: **schema + storage** gives you structured persistence — a content lake, usable without any UI. Add **editor** and it's a CMS. The **admin** is a shell around the editor. The **access** layer gates the admin.

Features you might think of as "versioning" or "scheduled publishing" are implemented as **schema augmentation helpers** (`publishFields()`, `tagsField()`) that inject conventional fields into any block. Storage doesn't know what those fields mean; resolution functions like `isLive(data)` read them at render time.

See `CLAUDE.md` for the full layering and where-things-live map. See `docs/roadmap.md` for what the starter deliberately doesn't do yet.

## Key files

| File | Purpose |
|------|---------|
| `src/schema/` | Block definitions (page, siteConfig, role-assignment) and section definitions |
| `src/schema/registry.ts` | The block registry the admin sidebar reads from |
| `src/storage.ts` | Single storage instance used across the app |
| `src/blob-adapter.ts`, `src/blob-store.ts` | Filesystem-backed storage — swap `store:` to change backend |
| `src/seed.ts` | Sample content shipped with fresh clones |
| `src/access/index.ts` | Auth adapter, role store, policy composition |
| `src/middleware.ts` | Cookie → identity → gate `/admin/*` |
| `src/data/page.ts` | Public-side fetchers; filters by `isLive()` so drafts don't leak |
| `src/pages/[...slug].astro` | Public page router |
| `src/pages/admin.astro` | Admin home |
| `src/pages/admin/[blockType]/[id].astro` | Document editor route |
| `src/pages/admin/tags/` | Tag scheduler routes |
| `src/pages/admin/login.astro` + `api/admin/login.ts` | Dev login |
| `src/pages/api/admin/save.ts` | Document save handler (with access check) |
| `src/pages/api/admin/bulk-publish.ts` | Bulk publish-window updates driven by the tag scheduler |
| `src/admin/` | React islands — `AdminHomeIsland`, `AdminEditorIsland`, `AdminTagsIsland`, `AdminTagSchedulerIsland` |
| `src/components/` | Public-site section renderers |
| `src/styles/globals.css`, `admin-theme.css` | Public + admin themes |
| `data/*.json` | Content storage (git-trackable) |
| `docs/` | Recipe docs (start here for "how do I...") |

## Editing content

Two paths:

- **Via the admin UI** — visit `/admin`, sign in as admin, click a page, edit, save. JSON file in `data/` is updated.
- **By editing JSON directly** — `data/page.json` is plain JSON; edit in any editor. *Not while the dev server is running an open admin* — the next save will overwrite.

Both paths use the same storage adapter; the admin is a view over the filesystem, not a separate system.

## Auth

Ships wired up, not a DIY exercise. The dev adapter uses hardcoded test accounts (`admin@local`, `viewer@local`). Swap for real OAuth before deploying:

- [docs/authentication.md](docs/authentication.md) — the v1 flow end to end
- [docs/seeding-the-first-admin.md](docs/seeding-the-first-admin.md) — `SEED_ADMIN_ID` env var, close-the-backdoor behaviour
- [docs/upgrading-users.md](docs/upgrading-users.md) — how to grant someone admin rights
- [docs/add-google-auth.md](docs/add-google-auth.md) — swap the dev adapter for Google Sign-In

## Customising

- [docs/add-document-types.md](docs/add-document-types.md) — add a new block type end-to-end
- [docs/theme-the-website.md](docs/theme-the-website.md) — port the admin glass aesthetic to the public site
- [docs/port-your-data.md](docs/port-your-data.md) — import from Sanity or Markdown; swap storage backends

All recipes in [docs/](docs/).

## Deploying

Two modes, same source tree:

### Mode A — Netlify (admin works)

```bash
npm run build
```

Public pages are prerendered HTML. Admin routes are bundled as Netlify functions. Edits via the admin write through to whatever storage you've configured in `src/storage.ts`.

### Mode B — static tarball (admin not included)

```bash
npm run build:static
# → static-build.tar.gz
```

Public HTML only. Drop the tarball on any object store — S3, GCS, R2, Cloudflare Pages, GitHub Pages. No functions, no cold starts, basically free hosting. Edit content via `npm run dev`'s admin, commit `data/*.json`, rebuild. See `docs/roadmap.md` for when each path fits.

## For agents

This starter is written to be productive under agent-assisted development — Claude or equivalent. See [`CLAUDE.md`](CLAUDE.md) for the layering and conventions, [`llms.txt`](llms.txt) for the curated read order. Every `@verevoir/*` package has its own `CLAUDE.md` / `llms.txt` for deeper drills.

## License

MIT
