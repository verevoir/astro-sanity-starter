import type { BlockDefinition, FieldRecord } from "@verevoir/schema";
import { page } from "./page";
import { siteConfig } from "./site-config";

/**
 * Registry of all block types in this starter. The admin uses this
 * to look up the correct BlockDefinition for a given blockType string.
 */
export const blocks: Record<string, BlockDefinition<FieldRecord>> = {
  page,
  siteConfig,
};

export type BlockType = keyof typeof blocks;
