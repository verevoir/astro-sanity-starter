import { seed } from "../seed";

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;
  await seed();
  seeded = true;
}
