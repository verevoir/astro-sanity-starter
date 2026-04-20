# Upgrading users

Once you've seeded your first admin, everyone else who authenticates is a **viewer** — they can see the admin UI but can't change anything. To grant admin rights to another user, you add a role-assignment for their identity id.

## v1: via the admin UI

Role assignments are a first-class block type called `role-assignment`, stored in the same database as your content. The admin sidebar shows them under the **Configuration** category.

1. Sign in as an existing admin.
2. Open **Configuration → Role assignments** in the sidebar.
3. Click **New role assignment**.
4. Fill in:
   - **User ID** — the value of `identity.id` for the user. With test-accounts this is whatever `identity.id` you registered in `src/access/index.ts`. With Google, it's the `sub` claim your adapter surfaces (often an email or numeric id).
   - **Roles** — `admin` for full admin access, `viewer` for explicit read-only. Anyone without an assignment is already a viewer, so `['viewer']` is rarely useful as an explicit grant — use it to re-enable someone who had admin and you want to demote.
5. Save.

The new assignment takes effect on the target user's next request — no restart needed.

## Downgrading or revoking

Same flow — edit or delete the `role-assignment` doc. The role store caches nothing, so changes are live on the next request for that identity.

## Why the v1 UX is blunt

v1 routes role management through the plain block editor — same form you use for pages and site config. It works but it's not discoverable, and it makes you think in terms of the internal `identity.id` shape.

v1.1 will add a dedicated **Users** page with a friendlier flow: list of authenticated identities, per-row role toggle, invite-by-email for OAuth adapters that support it. The underlying data stays the same (`role-assignment` docs via `createRoleStore`), so no migration — the better UI is a pure addition.

## Edge cases

- **You delete your own admin assignment.** The check-before-seed doesn't re-open the env path while you're still logged in; you'd lose admin on next request, but a restart with `SEED_ADMIN_ID` set re-seeds (if zero admins exist at startup). Break-glass is automatic, as designed.
- **Two people have the same `identity.id`.** Don't do this — your adapter should guarantee unique ids. If it can't (e.g. multiple OAuth providers aliased to the same account), use the role-store's `userId` to target the canonical id and map provider-specific ids to it in your adapter.

## Programmatic API

If you need to script role changes (e.g. seeding a test environment), the role store is importable:

```ts
import { roleStore } from '@/access';
await roleStore.setRoles('bob@example.com', ['admin']);
await roleStore.listAssignments();
```

Same interface that the UI drives.
