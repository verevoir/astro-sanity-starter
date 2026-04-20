# Seeding the first admin

The first admin is created via a one-time env-var bootstrap. Once any admin exists in the role store, the env is ignored — the backdoor closes on its own.

## How it works

1. Set `SEED_ADMIN_ID` in your environment (usually via `.env`, Netlify env vars, or your hosting provider's config).
2. That identity logs in for the first time.
3. The role store sees zero existing role assignments, matches the env-provided id against the login, and creates a `role-assignment` doc with `roles: ['admin']`.
4. From this point on, the role store has at least one admin. The env is still read, but ignored — subsequent `SEED_ADMIN_ID` changes have no effect unless the role store is wiped.

This is implemented by `createRoleStore` in `@verevoir/access/role-store`; see the `seedAdmin` option in `src/access/index.ts`.

## Setting `SEED_ADMIN_ID`

Create a `.env` file (git-ignored) in the project root:

```
SEED_ADMIN_ID=admin@local
```

For the shipped test-accounts adapter, `admin@local` is the id of one of the pre-registered test identities, so the login dropdown offers it directly.

For a real OAuth provider, `SEED_ADMIN_ID` is whatever `identity.id` your adapter resolves — for Google that's the subject claim (`sub`), typically `your.name@gmail.com` or the numeric Google id, depending on how you write the adapter.

## What happens if you don't set it

The site boots. Everyone who authenticates is a viewer. Nothing gets written. The admin UI loads read-only.

That's a valid state — if you're evaluating the starter without touching content, you don't need an admin. When you want to edit, set `SEED_ADMIN_ID`, restart, and log in.

## Closing the backdoor

The "backdoor" here is the ability for someone with server-config access to promote themselves to admin via an env var. That's a reasonable bootstrap power but you don't want it to persist — otherwise changing `SEED_ADMIN_ID` after the fact could reopen admin access for a different identity.

The close behaviour is implemented as: `hasAnyAdmin(storage)` is checked before seeding. Once it's true (any stored role-assignment grants `admin`), seeding is a no-op regardless of env.

**Break-glass:** if your role store ever ends up with zero admins — accidental delete, migration mistake, disaster recovery — the env becomes live again on next restart. This is deliberate: you should always be able to recover admin access. If you want to remove the break-glass, unset `SEED_ADMIN_ID` in prod.

## Upgrading from first admin to a team

See `upgrading-users.md`.
