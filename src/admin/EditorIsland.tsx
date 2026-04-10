import { useState } from "react";
import { BlockEditor } from "@verevoir/editor";
import type { BlockDefinition, FieldRecord } from "@verevoir/schema";
import { SectionsEditor } from "./SectionsEditor";

interface Section {
  _type: string;
  [key: string]: unknown;
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
}: EditorIslandProps) {
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

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
  );
}
