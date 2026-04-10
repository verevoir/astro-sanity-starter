import type { APIRoute } from "astro";
import { storage } from "../../../storage";
import { ensureSeeded } from "../../../data/init";
import { blocks } from "../../../schema/registry";

export const prerender = false;

interface SaveRequest {
  id: string;
  blockType: string;
  data: Record<string, unknown>;
}

export const POST: APIRoute = async ({ request }) => {
  await ensureSeeded();

  let body: SaveRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.id || !body.blockType || !body.data) {
    return new Response(
      JSON.stringify({ error: "Missing id, blockType, or data" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const block = blocks[body.blockType];
  if (!block) {
    return new Response(
      JSON.stringify({ error: `Unknown block type: ${body.blockType}` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Load the existing document so we can preserve fields not modeled
  // in the schema (e.g. the polymorphic `sections` array on pages).
  const existing = await storage.get(body.id);
  if (!existing) {
    return new Response(
      JSON.stringify({ error: `Document not found: ${body.id}` }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  // Validate the schema-modeled fields. Unknown fields pass through
  // unchanged to preserve any extra data on the document.
  try {
    block.validate(body.data);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Validation failed",
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 422, headers: { "Content-Type": "application/json" } },
    );
  }

  const merged = {
    ...(existing.data as Record<string, unknown>),
    ...body.data,
  };

  const updated = await storage.update(body.id, merged);

  return new Response(
    JSON.stringify({ id: updated.id, updatedAt: updated.updatedAt }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
};
