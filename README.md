# Astro + Verevoir Starter

A minimal Astro starter powered by [Verevoir](https://verevoir.io) — composable TypeScript libraries for structured content. No hosted backend, no API keys, no vendor lock-in.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — no accounts, no environment variables, no external services.

The admin lives at [http://localhost:3000/admin](http://localhost:3000/admin).

## What's Inside

A marketing site with composable page sections, all content-managed through Verevoir's schema engine and storage adapter:

- **Hero** — large heading, markdown body, call-to-action buttons
- **Cards** — grid of feature cards with badges, images, and CTAs
- **Logos** — animated logo strip with configurable motion
- **Testimonials** — quote cards with author info
- **CTA** — call-to-action section with heading and buttons

Plus a working admin (`/admin`) where you can edit page metadata and site config through a generated form. Edits write through to JSON files in `data/`, so they survive restarts and can be git-tracked.

### Tech Stack

- [Astro 6](https://astro.build) — static + server hybrid
- [@astrojs/netlify](https://docs.netlify.com/integrations/frameworks/astro/) — adapter for the admin functions
- [@astrojs/react](https://docs.astro.build/en/guides/integrations-guide/react/) — for the editor island
- [Tailwind CSS 4](https://tailwindcss.com) + [DaisyUI 5](https://daisyui.com) — public site styling
- [@verevoir/schema](https://www.npmjs.com/package/@verevoir/schema) — content model definitions (zod 4 under the hood)
- [@verevoir/storage](https://www.npmjs.com/package/@verevoir/storage) — persistence interface
- [@verevoir/editor](https://www.npmjs.com/package/@verevoir/editor) — auto-generated React forms

## How It Works

1. **Content models** are defined in `src/schema/` using `defineBlock()` from `@verevoir/schema`
2. **Storage** is a `BlobAdapter` (in `src/blob-adapter.ts`) backed by a pluggable `BlobStore` — the starter ships with `FilesystemBlobStore` writing JSON files to `data/`
3. **Sample content** is seeded on first run via `src/seed.ts` (idempotent — only seeds if empty)
4. **Public pages** are rendered by Astro components and prerendered at build time
5. **Admin** is a server-rendered route group at `/admin` using React islands for the editor

### Key files

| File | Purpose |
|------|---------|
| `src/schema/` | Verevoir block definitions (content types) |
| `src/schema/registry.ts` | Maps blockType strings → BlockDefinition (used by admin) |
| `src/blob-store.ts` | `BlobStore` interface + `FilesystemBlobStore` implementation |
| `src/blob-adapter.ts` | `BlobAdapter` — wraps any `BlobStore` to satisfy Verevoir's `StorageAdapter` |
| `src/storage.ts` | The single storage instance the rest of the app uses |
| `src/seed.ts` | Sample content — edit this to change what ships with the starter |
| `src/data/` | Read-side data fetching helpers |
| `src/pages/[...slug].astro` | Public pages |
| `src/pages/admin.astro` | Admin dashboard |
| `src/pages/admin/[blockType]/[id].astro` | Document editor (server-rendered) |
| `src/pages/api/admin/save.ts` | POST endpoint for saves (validates + merges + writes) |
| `src/admin/EditorIsland.tsx` | React island wrapping `<BlockEditor>` |
| `data/*.json` | Content storage (git-trackable) |

## Editing content

Two paths:

- **Through the admin UI** — visit `/admin`, click a page, edit the form, hit Save. The JSON file in `data/` is updated immediately.
- **By editing JSON directly** — `data/page.json` and `data/siteConfig.json` are plain JSON. Edit them in any editor; changes pick up on next request.

> ⚠️ **The admin has no auth out of the box.** This is intentional — see [Securing the admin](#securing-the-admin) below before deploying anywhere with sensitive content.

## Securing the admin

The admin route group (`/admin`, `/admin/*`, `/api/admin/*`) is unprotected by default. **Add auth before deploying to production.** The recommended path is Astro middleware + [@verevoir/access](https://www.npmjs.com/package/@verevoir/access).

### Option 1: Google Sign-In (recommended)

Most teams already have Google Workspace, so this is the path of least friction.

**1. Install the access package and the Google peer dep**

```bash
npm install @verevoir/access google-auth-library
```

**2. Set environment variables**

In `.env`:

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
ADMIN_EMAILS=alice@example.com,bob@example.com
SESSION_SECRET=generate-a-long-random-string
```

Get a client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → "Create OAuth client ID" → "Web application". Add `https://yoursite.com` to authorised origins and `https://yoursite.com/api/auth/google/callback` to redirect URIs.

**3. Create middleware** (`src/middleware.ts`)

```typescript
import { defineMiddleware } from "astro:middleware";
import { createGoogleAuthAdapter } from "@verevoir/access/google";

const adminEmails = new Set(
  (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()),
);

const auth = createGoogleAuthAdapter({
  clientId: process.env.GOOGLE_CLIENT_ID!,
});

export const onRequest = defineMiddleware(async (context, next) => {
  const isAdmin =
    context.url.pathname.startsWith("/admin") ||
    context.url.pathname.startsWith("/api/admin");

  if (!isAdmin) return next();

  const token = context.cookies.get("auth-token")?.value;
  const identity = token ? await auth.resolve(token) : null;

  const email = identity?.metadata?.email as string | undefined;
  if (!identity || !email || !adminEmails.has(email)) {
    return context.redirect("/login");
  }

  context.locals.identity = identity;
  return next();
});
```

**4. Add a sign-in page** at `/login` that renders Google's button and POSTs the resulting ID token to `/api/auth/google/callback`. The callback sets `auth-token` as an HttpOnly cookie. See the [Verevoir access guide](https://verevoir.io/docs/guides/access-control) for the full flow.

That's it — every `/admin` request now goes through Google ID token verification, and only emails listed in `ADMIN_EMAILS` get through.

### Option 2: Apple Sign-In

```bash
npm install @verevoir/access
```

```typescript
import { createAppleAuthAdapter } from "@verevoir/access/apple";

const auth = createAppleAuthAdapter({
  clientId: process.env.APPLE_CLIENT_ID!,
  // Provide a verifier — Verevoir is verifier-agnostic so you can
  // use jose, jwt-decode, or hand-roll one.
});
```

The middleware shape is identical to the Google example — only the adapter import changes.

### Option 3: Generic OIDC (Okta, Azure AD, Auth0, Keycloak, ...)

```bash
npm install @verevoir/access
```

```typescript
import { createOIDCAuthAdapter } from "@verevoir/access/oidc";

const auth = createOIDCAuthAdapter({
  issuer: process.env.OIDC_ISSUER!,        // e.g. https://your-tenant.okta.com
  clientId: process.env.OIDC_CLIENT_ID!,
  // The adapter handles JWKS fetching and token verification.
});
```

Works with any OIDC-compliant identity provider — Okta, Azure AD, Auth0, Keycloak, Authentik, Zitadel, etc.

### Option 4: Test accounts (for local dev only)

```typescript
import { createTestAuthAdapter } from "@verevoir/access/test-accounts";

const auth = createTestAuthAdapter({
  accounts: [
    { token: "alice-token", identity: { id: "alice", roles: ["admin"], metadata: { email: "alice@example.com" } } },
  ],
});
```

Hard-coded users for development. Never use in production.

### Role-based access (optional)

If you want different admin roles (e.g. editors vs admins), use `@verevoir/access/role-store` to persist user → roles mappings via your existing `BlobAdapter`. See the [access control guide](https://verevoir.io/docs/guides/access-control) for examples.

## Customising content

Edit `src/seed.ts` to change the site content the starter ships with. The seed only runs if the data files don't exist yet — once you have content in `data/`, the seed is a no-op.

To change what fields are editable in the admin, edit `src/schema/page.ts` (or add new block files) and register them in `src/schema/registry.ts`.

## Storage backends

The starter uses `FilesystemBlobStore` — JSON files on local disk, git-trackable. The `BlobAdapter` accepts any `BlobStore` though, so swapping the backend is a one-line change in `src/storage.ts`:

```typescript
// Local filesystem (default)
new BlobAdapter({ store: new FilesystemBlobStore({ dataDir: "./data" }) })

// Google Cloud Storage (when GcsBlobStore is added)
new BlobAdapter({ store: new GcsBlobStore({ bucket: "my-content" }) })

// S3 / R2 / MinIO / Spaces (when S3BlobStore is added)
new BlobAdapter({ store: new S3BlobStore({ bucket: "my-content" }) })

// Or for production at scale, drop BlobAdapter entirely:
import { PostgresAdapter } from "@verevoir/storage";
new PostgresAdapter({ connectionString: process.env.DATABASE_URL! })
```

The schema and the rest of the app don't change — only `src/storage.ts`.

## Deploying

Two modes, **same source tree, no config swap**:

### Mode A — Netlify (admin works)

```bash
npm run build
# Deploy via netlify-cli, GitHub integration, or drag-and-drop
```

Public pages are prerendered HTML. Admin routes (`/admin`, `/api/admin/*`) are bundled as Netlify functions. Edits made through the admin write through to the storage backend you've configured in `src/storage.ts`.

### Mode B — static export (admin doesn't function)

```bash
npm run build:static
# → static-build.tar.gz
```

Builds the same project, then tarballs just the static portion of the output (`dist/`) into `static-build.tar.gz`. Drop that tarball on any object store — S3, GCS, R2, Cloudflare Pages, GitHub Pages, etc. Public pages work everywhere; admin is unavailable (the function code isn't included).

This is useful when:
- You want a fully static deploy with no functions / no cold starts
- You're git-managing content and don't need a runtime editor
- You want to deploy the same site to multiple hosts (one for production, one as a backup mirror)
- You want zero hosting cost (object stores are basically free at low traffic)

The trade-off is obvious: no live editing on a static-only deploy. Edit content via the dev server's admin (`npm run dev`), commit `data/*.json` to git, then rebuild and re-export. Or move to Mode A.

## License

MIT
