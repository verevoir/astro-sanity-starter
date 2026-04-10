import { storage } from "../storage";

export async function fetchData() {
  const docs = await storage.list("siteConfig");
  if (docs.length === 0) return null;
  return docs[0].data;
}
