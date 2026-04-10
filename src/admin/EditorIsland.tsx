import { useState } from "react";
import { BlockEditor } from "@verevoir/editor";
import type { BlockDefinition, FieldRecord } from "@verevoir/schema";

interface EditorIslandProps {
  id: string;
  blockType: string;
  initialData: Record<string, unknown>;
  block: BlockDefinition<FieldRecord>;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Client-side editor wrapper. Renders the @verevoir/editor BlockEditor
 * and handles the save flow via POST /api/admin/save.
 *
 * Loaded as a React island in admin Astro pages with `client:only="react"`.
 */
export function EditorIsland({
  id,
  blockType,
  initialData,
  block,
}: EditorIslandProps) {
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, blockType, data }),
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
      <BlockEditor block={block} value={data} onChange={setData} />

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
