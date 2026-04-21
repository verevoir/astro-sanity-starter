import { isLive } from "@verevoir/editor";
import { storage } from "../storage";

/**
 * Live pages only. The public site doesn't render drafts, scheduled
 * (publishFrom in the future), or expired (publishTo in the past)
 * documents — `isLive(data)` is the resolution function. Admin
 * routes use the underlying storage directly to see everything.
 */
export async function fetchData() {
  const docs = await storage.list("page");
  return docs
    .filter((doc) => isLive(doc.data as Record<string, unknown>))
    .map((doc) => ({
      id: doc.id,
      ...(doc.data as Record<string, unknown>),
    }));
}

export async function getPageById(id: string) {
  const doc = await storage.get(id);
  if (!doc) return null;
  if (!isLive(doc.data as Record<string, unknown>)) return null;
  return { id: doc.id, ...(doc.data as Record<string, unknown>) };
}
