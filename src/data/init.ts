import { storage } from "../storage";
import { seed } from "../seed";

let initialized = false;

export async function ensureSeeded() {
  if (initialized) return;
  await storage.connect();
  await seed();
  initialized = true;
}
