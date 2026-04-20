import type { APIRoute } from "astro";
import { storage } from "@/storage";
import { ensureSeeded } from "@data/init";

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
 * Currently deny-none: any admin user can hit this endpoint. Wire
 * an access check around the body below when authentication lands
 * on the starter — the shape maps one-to-one onto
 * `access.can(identity, 'update', doc)` per id.
 */
export const POST: APIRoute = async ({ request }) => {
  await ensureSeeded();

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
      await storage.update(id, nextData);
      updated += 1;
    } catch (e) {
      errors.push({ id, reason: e instanceof Error ? e.message : "update failed" });
    }
  }

  return Response.json({ updated, errors });
};
