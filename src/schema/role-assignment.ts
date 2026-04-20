import { defineBlock, text, array } from "@verevoir/schema";

/**
 * Role assignment block — maps an identity to a set of role names.
 *
 * Consumed by `@verevoir/access/role-store`'s createRoleStore, which
 * writes and reads docs of this type via the storage adapter. Must
 * use the block-type string `'role-assignment'` — that's what the
 * store looks for; naming here exists so the admin sidebar can show
 * the same rows under a friendlier label.
 *
 * v1: admin creates / edits these directly in the admin UI. See
 * docs/upgrading-users.md. v1.1 gets a dedicated Users page with a
 * nicer flow over the same data.
 */
export const roleAssignment = defineBlock({
  name: "role-assignment",
  fields: {
    userId: text("User ID").hint(
      "The identity id this assignment applies to — e.g. the value of `identity.id` from your auth provider.",
    ),
    roles: array("Roles", text("Role")).hint(
      "Role names. v1 recognises 'admin' (all actions) and 'viewer' (read only). Anyone authenticated without an assignment is a viewer by default.",
    ),
  },
});
