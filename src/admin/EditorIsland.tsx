import { useState, useCallback } from "react";
import {
  BlockEditor,
  LinkSearchProvider,
  type LinkSearchResult,
} from "@verevoir/editor";
import type { BlockDefinition, FieldRecord } from "@verevoir/schema";
import { SectionsEditor } from "./SectionsEditor";

interface Section {
  _type: string;
  [key: string]: unknown;
}

/**
 * A page that the link picker can target. Passed in from the
 * server-rendered Astro route so we don't need an API endpoint just
 * for search.
 *
 * PROMOTE: this in-memory search pattern (and the matching
 * LinkSearchProvider wiring) is a clear candidate for the future
 * @verevoir/admin package — wire it once at the AdminShell level
 * with a StorageAdapter, every editor below gets a working picker
 * for free.
 */
export interface LinkablePage {
  id: string;
  title: string;
  url: string;
  blockType: string;
}

interface EditorIslandProps {
  id: string;
  blockType: string;
  initialData: Record<string, unknown>;
  block: BlockDefinition<FieldRecord>;
  /**
   * Whether this block has a polymorphic `sections` array that should
   * be rendered with the SectionsEditor in addition to the metadata
   * BlockEditor. Currently true only for the `page` block type.
   */
  hasSections?: boolean;
  /** Initial sections array (passed straight to SectionsEditor) */
  initialSections?: Section[];
  /**
   * The full set of pages the LinkField picker can search. Provided
   * by the server-rendered admin route from the storage adapter.
   * If empty, the LinkField browse button is hidden (the auto-detect
   * still works for typed values).
   */
  linkablePages?: LinkablePage[];
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Client-side editor wrapper. Renders the @verevoir/editor BlockEditor
 * for schema-modeled fields, plus an optional SectionsEditor for
 * polymorphic page sections.
 *
 * Save flow: combines the metadata fields with the sections array (and
 * any other passthrough data) into a single payload, POSTs to
 * /api/admin/save, which merges into the existing document.
 *
 * Loaded as a React island in admin Astro pages with `client:only="react"`.
 */
export function EditorIsland({
  id,
  blockType,
  initialData,
  block,
  hasSections = false,
  initialSections = [],
  linkablePages = [],
}: EditorIslandProps) {
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // In-memory search over the page list — fast, no network round-trip,
  // case-insensitive substring match on title and url.
  const linkSearch = useCallback(
    async (query: string): Promise<LinkSearchResult[]> => {
      const q = query.trim().toLowerCase();
      const matches = q
        ? linkablePages.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.url.toLowerCase().includes(q),
          )
        : linkablePages;
      return matches.slice(0, 20);
    },
    [linkablePages],
  );

  const handleSave = async () => {
    setStatus("saving");
    setError(null);
    try {
      const payload: Record<string, unknown> = { ...data };
      if (hasSections) payload.sections = sections;

      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, blockType, data: payload }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <LinkSearchProvider search={linkSearch}>
      <div className="editor-island">
        <section className="editor-section">
          <h2 className="editor-section-title">Page details</h2>
          <BlockEditor block={block} value={data} onChange={setData} />
        </section>

        {hasSections && (
          <section className="editor-section">
            <SectionsEditor sections={sections} onChange={setSections} />
          </section>
        )}

        <div className="editor-actions">
          <button
            type="button"
            onClick={handleSave}
            disabled={status === "saving"}
            className="btn btn-primary"
          >
            {status === "saving" ? "Saving…" : "Save"}
          </button>
          {status === "saved" && (
            <span className="editor-status editor-status-success">Saved</span>
          )}
          {status === "error" && (
            <span className="editor-status editor-status-error">
              Error: {error}
            </span>
          )}
        </div>
      </div>
    </LinkSearchProvider>
  );
}
