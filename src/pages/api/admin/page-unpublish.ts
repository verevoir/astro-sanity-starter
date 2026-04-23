import type { APIRoute } from "astro";
import { ensureSeeded } from "@data/init";
import { policy } from "@/access";
import { pageVersionStore } from "@/server/page-versions";

export const prerender = false;

interface Body {
  id?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  await ensureSeeded();
  const identity = locals.identity;
  if (!identity) return new Response("Unauthenticated", { status: 401 });
  if (!policy.can(identity, "update")) {
    return new Response("Forbidden", { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as Body;
  if (!body.id) return new Response("id required", { status: 400 });
  await pageVersionStore.unpublish(body.id);
  return Response.json({ ok: true });
};
