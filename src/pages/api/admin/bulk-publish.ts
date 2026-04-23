import type { APIRoute } from "astro";
import { storage } from "@/storage";
import { ensureSeeded } from "@data/init";
import { policy } from "@/access";
import { pageVersionStore } from "@/server/page-versions";

export const prerender = false;

interface BulkPublishBody {
  documentIds?: string[];
  publishFrom?: string;
  publishTo?: string;
}

/**
 * Bulk update of publishFrom / publishTo across a list of document
 * ids. Driven by the admin's TagScheduler — the tag lookup itself
 * happened server-side when the page loaded; this route just takes
 * the ids and the new window.
 *
 * Versioning behaviour: for `page` documents, the route both sets
 * the temporal window AND promotes the version to `published`
 * (which archives any prior published version of the same slug).
 * Without the promotion, scheduling a draft would leave it as a
 * draft — visible in admin but never live, defeating the point of
 * "schedule this tag for X". For non-versioned block types the
 * route falls through to the simple window update.
 *
 * The middleware guarantees an authenticated identity on locals
 * (unauth'd requests are redirected to /admin/login before this
 * route runs). We additionally check `policy.can(identity, 'update')`
 * here: viewers authenticate but can't mutate.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  await ensureSeeded();

  const identity = locals.identity;
  if (!identity) {
    return new Response("Unauthenticated", { status: 401 });
  }
  if (!policy.can(identity, "update")) {
    return new Response("Forbidden", { status: 403 });
  }

  let body: BulkPublishBody;
  try {
    body = (await request.json()) as BulkPublishBody;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const ids = Array.isArray(body.documentIds) ? body.documentIds : [];
  if (ids.length === 0) {
    return new Response("No documentIds provided", { status: 400 });
  }

  const { publishFrom, publishTo } = body;
  let updated = 0;
  const errors: Array<{ id: string; reason: string }> = [];

  for (const id of ids) {
    const existing = await storage.get(id);
    if (!existing) {
      errors.push({ id, reason: "not found" });
      continue;
    }
    const nextData = {
      ...(existing.data as Record<string, unknown>),
      ...(publishFrom !== undefined ? { publishFrom } : {}),
      ...(publishTo !== undefined ? { publishTo } : {}),
    };
    try {
      // Update the data first (window + any other fields).
      await storage.update(id, nextData);
      // For versioned page docs, also promote draft → published so
      // the schedule actually fires. Other block types just need
      // the window set.
      if (
        existing.blockType === "page" &&
        (existing.data as { status?: string }).status === "draft"
      ) {
        await pageVersionStore.publish(id);
      }
      updated += 1;
    } catch (e) {
      errors.push({ id, reason: e instanceof Error ? e.message : "update failed" });
    }
  }

  return Response.json({ updated, errors });
};
