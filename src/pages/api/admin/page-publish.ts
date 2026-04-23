import type { APIRoute } from "astro";
import { ensureSeeded } from "@data/init";
import { policy } from "@/access";
import { pageVersionStore } from "@/server/page-versions";

export const prerender = false;

interface Body {
  id?: string;
}

/**
 * Promote a page version to `published`. Archives any prior
 * published version of the same slug. Same access check shape as
 * the rest of the admin: middleware guarantees identity, this
 * route gates on `policy.can(identity, 'update')`.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  await ensureSeeded();
  const identity = locals.identity;
  if (!identity) return new Response("Unauthenticated", { status: 401 });
  if (!policy.can(identity, "update")) {
    return new Response("Forbidden", { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as Body;
  if (!body.id) return new Response("id required", { status: 400 });
  await pageVersionStore.publish(body.id);
  return Response.json({ ok: true });
};
