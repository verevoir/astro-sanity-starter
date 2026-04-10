import type { BlockRegistry, SectionEntry } from "@verevoir/admin";
import { page } from "./page";
import { siteConfig } from "./site-config";
import { sectionDefinitions } from "./sections";

/**
 * Registry of all block types in this starter, in the shape that
 * @verevoir/admin expects. Each entry pairs a block definition with
 * optional admin metadata (label, singleton flag, preview function).
 */
export const blocks: BlockRegistry = {
  page: {
    block: page,
    label: "Pages",
    preview: (data) => {
      const slug = data.slug as string | undefined;
      return slug ?? "/";
    },
  },
  siteConfig: {
    block: siteConfig,
    label: "Site configuration",
    singleton: true,
  },
};

export const sections: SectionEntry[] = sectionDefinitions;

export type BlockType = keyof typeof blocks;
