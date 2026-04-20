# Add Google auth

The starter ships with a dev-only test-accounts adapter. Here's how to swap it for Google Sign-In.

## Prerequisites

- A Google Cloud project with OAuth 2.0 client credentials. The client id looks like `123456789-abcdef.apps.googleusercontent.com`.
- Add your deployed origin (e.g. `https://yoursite.com`) and `http://localhost:4321` as **Authorised JavaScript origins** in the Google Cloud console.
- Add your callback URL (`https://yoursite.com/api/admin/login` and the localhost variant) as **Authorised redirect URIs**.

Put the client id in `.env`:

```
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
```

## Swap the adapter

In `src/access/index.ts`, replace:

```ts
import { createTestAuthAdapter } from "@verevoir/access/test-accounts";

export const auth = createTestAuthAdapter({
  accounts: [/* ... */],
});
```

with:

```ts
import { createGoogleAuthAdapter } from "@verevoir/access/google";

export const auth = createGoogleAuthAdapter({
  allowedClientIds: [import.meta.env.GOOGLE_CLIENT_ID!],
  // Optional: restrict to a Google Workspace domain
  // hostedDomain: 'yourcompany.com',
});
```

`@verevoir/access/google` isn't installed by default — add it:

```bash
npm install @verevoir/access
```

(The meta-package `@verevoir/access` re-exports `./google`, `./apple`, `./oidc` as subpath entries.)

## Update the login flow

Test-accounts accepted a hardcoded token from a `<select>`. Google issues an ID token when the user signs in. You have two integration choices:

### Option 1 — Google Identity Services button (recommended)

Replace the `<select>` in `src/pages/admin/login.astro` with Google's button + a POST on success:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
<div
  id="g_id_onload"
  data-client_id={import.meta.env.GOOGLE_CLIENT_ID}
  data-login_uri={`${Astro.site}api/admin/login`}
  data-auto_select="true"
></div>
<div class="g_id_signin" data-type="standard"></div>
```

Google POSTs the id token to `/api/admin/login` as `credential` in the form. Update the login route:

```ts
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const token = form.get("credential")?.toString() ?? form.get("token")?.toString();
  // ... rest stays the same
};
```

### Option 2 — OAuth redirect flow

More moving parts but lets you control the UX. The starter doesn't ship this; see `@verevoir/access`'s examples if you need it.

## Update SEED_ADMIN_ID

With test-accounts, `SEED_ADMIN_ID` matched a hardcoded identity. With Google, it matches the `sub` claim. The Google adapter typically puts the user's email on `identity.id` — check your adapter code for the exact shape.

```
# .env
SEED_ADMIN_ID=you@yourcompany.com
```

Log in once. The role store captures your admin assignment. From then on, `SEED_ADMIN_ID` is ignored — see `seeding-the-first-admin.md`.

## Keep test-accounts for local dev

A common pattern: Google in prod, test-accounts in local dev. Gate the adapter choice on the environment:

```ts
export const auth = import.meta.env.PROD
  ? createGoogleAuthAdapter({ allowedClientIds: [import.meta.env.GOOGLE_CLIENT_ID!] })
  : createTestAuthAdapter({ accounts: [/* ... */] });
```

The import path `@verevoir/access/test-accounts` is already the safety flag — it stands out in review. No runtime env checks needed beyond this conditional.

## Troubleshooting

- **`identity` resolves as `null`** — verify your `allowedClientIds` includes the client id of the UI that issued the token. Token was signed for a different audience.
- **Cookie set but `/admin` still redirects** — the cookie contains the raw id token; on the next request the middleware calls `auth.resolve(token)` which verifies it again. Check the server console for verification errors.
- **CORS / redirect URI mismatch** — Google is strict; the exact scheme + host + port must match an entry in the OAuth client's Authorised redirect URIs.
