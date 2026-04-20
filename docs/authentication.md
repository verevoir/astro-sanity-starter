# Authentication

The starter ships with a dev-only auth flow based on `@verevoir/access/test-accounts`. It's enough to exercise the full admin path locally without any OAuth setup; in production you swap the adapter.

## Two deployment paths

| Path | Auth needed? | Command |
|---|---|---|
| **Static build** — tarball of HTML + assets, no admin at runtime | No | `npm run build:static` |
| **Hosted admin** — live `/admin`, content editable at runtime | Yes | `npm run build` + deploy |

Editing happens at dev time in both cases. Only the *hosted admin at runtime* needs auth.

## How it fits together

| Piece | File |
|---|---|
| Adapter (token → identity) | `src/access/index.ts` → `auth` |
| Role store (persist identity → roles) | `src/access/index.ts` → `roleStore` |
| Policy (role → actions) | `src/access/index.ts` → `policy` |
| Combined resolver | `src/access/index.ts` → `resolveIdentity(token)` |
| Request-level identity | `src/middleware.ts` — reads the cookie, calls `resolveIdentity`, puts the result on `context.locals.identity` |
| Login / logout | `src/pages/admin/login.astro` + `src/pages/api/admin/{login,logout}.ts` |

The middleware gates `/admin/*` and `/api/admin/*`. Unauthenticated requests bounce to `/admin/login?returnTo=...`. Everything outside those prefixes is untouched — the public site doesn't see auth.

## Roles

Two tiers in v1:

- **admin** — every action. Seeded via env (see `seeding-the-first-admin.md`) and optionally granted through the role-assignment block in the admin UI.
- **viewer** — read only. Default for anyone authenticated who doesn't have an explicit assignment.

`policy.can(identity, 'update')` is the standard gate on mutating endpoints — see `/api/admin/save.ts` and `/api/admin/bulk-publish.ts` for the pattern.

## Swapping test-accounts for real auth

In `src/access/index.ts`, replace `createTestAuthAdapter(...)` with a real adapter:

```ts
import { createGoogleAuthAdapter } from '@verevoir/access/google';

export const auth = createGoogleAuthAdapter({
  allowedClientIds: [process.env.GOOGLE_CLIENT_ID!],
});
```

The rest — role store, policy, middleware, cookie — stays the same. See `add-google-auth.md`.

## Where to look when things break

- Cookie not sticking → check the `sameSite`/`secure` attributes in `src/pages/api/admin/login.ts` against your deployment's scheme
- 403 on POSTs → Astro enforces origin checks on form posts; browsers set the Origin header automatically, but curl/test clients need it explicitly
- Identity resolves as `null` → the token in the cookie doesn't match any `TestAccount` registered in `src/access/index.ts`
