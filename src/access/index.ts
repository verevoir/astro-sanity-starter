import { definePolicy, type Identity } from "@verevoir/access";
import { createTestAuthAdapter } from "@verevoir/access/test-accounts";
import { createRoleStore } from "@verevoir/access/role-store";
import { storage } from "@/storage";

/**
 * Auth + access for the starter.
 *
 * - `auth` — how incoming tokens become identities. In dev this is a
 *   test-accounts adapter (hardcoded token → identity). For a real
 *   deployment, swap for `@verevoir/access/google` (or oidc/apple).
 *   See `docs/add-google-auth.md`.
 * - `roleStore` — persisted map of `identityId → roles[]`. Backed by
 *   the same storage as content. First login by the seed admin
 *   bootstraps the first admin assignment; after any assignment
 *   exists the env seed is ignored (the backdoor closes).
 * - `policy` — two-tier v1: admin does everything, viewer reads.
 * - `resolveIdentity` — the combined entry point: token → base
 *   identity → attach stored roles → return identity or null.
 *
 * Authenticated users with no stored roles default to `['viewer']`.
 * Upgrades are per `docs/upgrading-users.md`.
 */

const SEED_ADMIN_ID = import.meta.env.SEED_ADMIN_ID;

export const auth = createTestAuthAdapter({
  accounts: [
    {
      token: "admin-token",
      identity: {
        id: "admin@local",
        roles: [],
        metadata: { email: "admin@local" },
      },
    },
    {
      token: "viewer-token",
      identity: {
        id: "viewer@local",
        roles: [],
        metadata: { email: "viewer@local" },
      },
    },
  ],
});

export const roleStore = createRoleStore({
  storage,
  seedAdmin: SEED_ADMIN_ID
    ? { userId: SEED_ADMIN_ID, roles: ["admin"] }
    : undefined,
});

export const policy = definePolicy({
  rules: [
    {
      role: "admin",
      actions: ["read", "create", "update", "delete", "publish"],
    },
    { role: "viewer", actions: ["read"] },
  ],
});

export async function resolveIdentity(
  token: string | undefined,
): Promise<Identity | null> {
  if (!token) return null;
  const base = await auth.resolve(token);
  if (!base) return null;
  const storedRoles = await roleStore.getRoles(base.id);
  const roles = storedRoles.length > 0 ? storedRoles : ["viewer"];
  return { ...base, roles };
}

export type { Identity };
