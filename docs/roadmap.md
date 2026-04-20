# Roadmap

The starter ships intentionally small — enough to demonstrate the Verevoir stack end-to-end without committing to the decisions a production CMS needs. This doc captures the trajectory so you know where the v1 compromises are and what comes next.

## What v1 is

A working content site + admin in a single Astro project, with:

- **Schema** as code — `@verevoir/schema`, blocks compose from field helpers.
- **Storage** over a pluggable adapter — `@verevoir/storage` + a BlobAdapter that writes JSON files in `./data`. Swap for Postgres, GCS, or a SanityAdapter without touching the rest.
- **Admin** — `@verevoir/admin` shell, SectionsEditor for polymorphic arrays, the list+modal TableArrayField for object arrays, smart datetime input, tag scheduler with bulk publish windows.
- **Editor helpers** — `publishFields()` for workflow state + publish window, `tagsField()` for grouping, `isLive()` for rendering decisions.
- **Access** — `@verevoir/access` with test-accounts in dev, role-store bootstrapped from a `SEED_ADMIN_ID` env var, two-tier policy (admin / viewer).
- **Public site** — plain Astro + Tailwind + DaisyUI, rendered directly from the storage.

v1 works. It's deliberately *unfinished* — design decisions that would lock in a wrong future are left open.

## What v1 deliberately isn't

### Single-tenant

No accounts, memberships, or tenancy. One site, one content set, one admin team.

*Why left open:* Multi-tenancy reshapes storage keying, access checks, and the admin navigation. Opinionated tenancy before consumers had a chance to ask for it would be premature.

*Forward path:* `@verevoir/accounts` provides the primitives — accounts, memberships, invitations. The starter keeps the single-tenant path as a simple deployment model; the multi-tenant path becomes a separate recipe.

### Blunt role UX

Role assignments edit via the plain block form. Functional, not friendly.

*Forward path:* A dedicated **Users** page in the admin — identity list, per-row role toggle, invite flow for OAuth adapters that support email. Same data underneath (`role-assignment` block + `createRoleStore`).

### Doc-level versioning, not entity-level

A "version" is currently a document with `publishFrom`/`publishTo` carrying the temporal window. Multiple "versions" of a page = multiple docs sharing a slug, each with their own window. No version history per id.

*Why left open:* Versioning primitives live well at the storage layer but imposing a specific history model (copy-on-write vs event log vs time-travel query) without real consumer signal risks boxing later choices in.

*Forward path:* Storage-level version entity when the editing flow demands it. `publishFrom`/`publishTo` composes forward either way — you just carry them onto whichever primitive wins.

### No per-document access

The access policy checks role → action. It doesn't know about document ownership, team membership, or draft visibility rules.

*Forward path:* Extend the policy context with `ownerId` and `teamIds`; use the existing `scope: 'own'` rule form. The `canEdit` callback on `TagScheduler` and similar admin components already takes a per-doc predicate — swap the always-allow stub for a real check without refactoring.

### Public content is always public

No gated content, no member-only pages, no preview links.

*Forward path:* Depends on the model you want. Member-only pages = identity check on the public route. Preview links = signed URL + time-limited access. Both compose from `@verevoir/access` + storage reads; no new primitives needed.

### Auth UX is test-accounts-only

The login form is a dropdown of hardcoded dev identities. Obvious in dev, unusable in prod.

*Forward path:* Swap the adapter. `add-google-auth.md` walks it through. Apple / generic OIDC work the same way; see `@verevoir/access/apple` and `@verevoir/access/oidc`.

### No audit log

Mutations are unaudited. Who changed what, when, is invisible.

*Forward path:* An `auditLog` block type + middleware that records writes. Composes from storage — no new primitives. Add when compliance or forensics becomes a real need.

### Scheduler is opportunistic

`publishFrom` in the future just means `isLive()` returns false until that time. No separate scheduler or queue.

*Why left open:* The existing timing primitive does the work at read time. Adding a scheduler would add operational complexity for a gain that only matters when writes need to fire side-effects *at* the publish moment (email blasts, webhook delivery).

*Forward path:* A scheduled function (Netlify / Vercel cron) that queries `storage.list(..., { where: { publishFrom: ... }})` and fires side-effects when entries cross the threshold. Same storage, same data.

## Adjacent docs

- `authentication.md` — the v1 access flow
- `seeding-the-first-admin.md` — env bootstrap
- `upgrading-users.md` — role assignment via the admin UI
- `add-google-auth.md` — swap the adapter (to be written)
- `add-document-types.md` — define a new block + register it (to be written)
- `theme-the-website.md` — port the admin aesthetic to the public site (to be written)
- `port-your-data.md` — migrate from Sanity / another CMS (to be written)

## What I'd push back on

If you're planning a deployment that bumps into several of these limits (multi-tenant + team roles + scheduled publishing + audit), the starter isn't the right shape — you'd be better building up from the packages directly rather than inheriting starter-level decisions. The starter is a showcase and a fast-start path, not a production scaffold.
