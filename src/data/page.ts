import { storage } from "../storage";

export async function fetchData() {
  const docs = await storage.list("page");
  return docs.map((doc) => ({
    id: doc.id,
    ...(doc.data as Record<string, unknown>),
  }));
}

export async function getPageById(id: string) {
  const doc = await storage.get(id);
  if (!doc) return null;
  return { id: doc.id, ...(doc.data as Record<string, unknown>) };
}
