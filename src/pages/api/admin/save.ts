import type { APIRoute } from "astro";
import { createAstroSaveRoute } from "@verevoir/admin/astro";
import { storage } from "@/storage";
import { ensureSeeded } from "@data/init";
import { blocks } from "@schema/registry";

export const prerender = false;

// The base handler does the heavy lifting: parses the body,
// validates against the block registry, merges with the existing
// document, and writes through. We wrap it in a thin layer that
// ensures the storage is seeded on first call.
const baseHandler = createAstroSaveRoute({ storage, blocks });

export const POST: APIRoute = async (context) => {
  await ensureSeeded();
  return baseHandler({ request: context.request });
};
