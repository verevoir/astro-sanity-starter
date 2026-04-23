import type { APIRoute } from "astro";
import { ensureSeeded } from "@data/init";
import { policy } from "@/access";
import { pageVersionStore } from "@/server/page-versions";

export const prerender = false;

interface Body {
  sourceId?: string;
}

/**
 * Branch a new draft version from an existing version. Returns the
 * new version's id; the client navigates to its admin route.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  await ensureSeeded();
  const identity = locals.identity;
  if (!identity) return new Response("Unauthenticated", { status: 401 });
  if (!policy.can(identity, "update")) {
    return new Response("Forbidden", { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as Body;
  if (!body.sourceId) return new Response("sourceId required", { status: 400 });
  const newRecord = await pageVersionStore.createNewVersion(body.sourceId);
  return Response.json({ id: newRecord.id });
};
