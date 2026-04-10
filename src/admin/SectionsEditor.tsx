import { useState } from "react";
import { BlockEditor } from "@verevoir/editor";
import {
  sectionDefinitions,
  getSectionDefinition,
} from "@/schema/sections";

interface Section {
  _type: string;
  [key: string]: unknown;
}

interface SectionsEditorProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
}

/**
 * Polymorphic editor for an array of page sections.
 *
 * Each section's `_type` discriminator is used to look up the matching
 * block definition from the section registry. The schema-modeled fields
 * are rendered via @verevoir/editor's BlockEditor; nested arrays
 * (cards, testimonials items, etc.) that are NOT modeled in the section
 * schemas are preserved on edit and pass through unchanged.
 */
export function SectionsEditor({ sections, onChange }: SectionsEditorProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const updateSection = (index: number, updates: Record<string, unknown>) => {
    const next = [...sections];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    if (openIndex === from) setOpenIndex(to);
  };

  const removeSection = (index: number) => {
    const next = sections.filter((_, i) => i !== index);
    onChange(next);
    if (openIndex === index) setOpenIndex(null);
    else if (openIndex !== null && openIndex > index) {
      setOpenIndex(openIndex - 1);
    }
  };

  const addSection = (type: string) => {
    const def = getSectionDefinition(type);
    if (!def) return;
    // Initialise with empty values for all schema-modeled fields.
    // The default theme/width values are required so the renderer
    // doesn't blow up when reading them.
    const initial: Section = { _type: type };
    for (const [name, field] of Object.entries(def.block.fields)) {
      const ui = field.meta.ui;
      if (ui === "text" || ui === "rich-text") initial[name] = "";
      else if (ui === "boolean") initial[name] = false;
      else if (ui === "number") initial[name] = 0;
      // Selects: pick the first option as the default
      else if (ui === "select") {
        const def2 = (
          field.schema as unknown as {
            _zod?: { def?: { entries?: Record<string, string> } };
          }
        )._zod?.def;
        const entries = def2?.entries;
        if (entries) initial[name] = Object.values(entries)[0];
      }
    }
    onChange([...sections, initial]);
    setOpenIndex(sections.length);
    setPickerOpen(false);
  };

  return (
    <div className="sections-editor">
      <div className="sections-header">
        <h2>Sections</h2>
        <span className="sections-count">{sections.length} section{sections.length === 1 ? "" : "s"}</span>
      </div>

      {sections.length === 0 ? (
        <div className="sections-empty">
          <p>No sections yet. Add one below.</p>
        </div>
      ) : (
        <ol className="sections-list">
          {sections.map((section, index) => {
            const def = getSectionDefinition(section._type);
            const heading = (section.heading as string | undefined) ?? "(no heading)";
            const isOpen = openIndex === index;
            const isUnknown = !def;

            return (
              <li
                key={index}
                className={`sections-item ${isOpen ? "is-open" : ""} ${isUnknown ? "is-unknown" : ""}`}
              >
                <header className="sections-item-header">
                  <button
                    type="button"
                    className="sections-item-toggle"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    disabled={isUnknown}
                  >
                    <span className="sections-item-type">
                      {def?.label ?? `Unknown: ${section._type}`}
                    </span>
                    <span className="sections-item-heading">{heading}</span>
                  </button>
                  <div className="sections-item-controls">
                    <button
                      type="button"
                      onClick={() => moveSection(index, index - 1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, index + 1)}
                      disabled={index === sections.length - 1}
                      aria-label="Move down"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `Delete this ${def?.label ?? section._type} section?`,
                          )
                        ) {
                          removeSection(index);
                        }
                      }}
                      aria-label="Delete section"
                      title="Delete section"
                      className="sections-item-delete"
                    >
                      ×
                    </button>
                  </div>
                </header>

                {isOpen && def && (
                  <div className="sections-item-body">
                    <BlockEditor
                      block={def.block}
                      value={section}
                      onChange={(updated) => updateSection(index, updated)}
                    />
                    {hasNestedArrays(section) && (
                      <p className="sections-item-note">
                        This section has nested content ({describeNested(section)}) that isn&apos;t editable through this form yet. It will be preserved when you save.
                      </p>
                    )}
                  </div>
                )}

                {isUnknown && (
                  <div className="sections-item-body">
                    <p className="sections-item-note">
                      This section type isn&apos;t registered. It will still
                      render on the public site if a matching component exists,
                      but can&apos;t be edited here. Define it in
                      <code> src/schema/sections/</code> to enable editing.
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div className="sections-add">
        {pickerOpen ? (
          <div className="sections-picker">
            <div className="sections-picker-header">
              <strong>Add a section</strong>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <ul className="sections-picker-list">
              {sectionDefinitions.map((def) => (
                <li key={def.type}>
                  <button type="button" onClick={() => addSection(def.type)}>
                    <span className="sections-picker-label">{def.label}</span>
                    <span className="sections-picker-type">{def.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setPickerOpen(true)}
          >
            + Add section
          </button>
        )}
      </div>
    </div>
  );
}

const NESTED_FIELDS = ["items", "cta"];

function hasNestedArrays(section: Section): boolean {
  return NESTED_FIELDS.some(
    (key) => Array.isArray(section[key]) && (section[key] as unknown[]).length > 0,
  );
}

function describeNested(section: Section): string {
  const parts: string[] = [];
  for (const key of NESTED_FIELDS) {
    if (Array.isArray(section[key]) && (section[key] as unknown[]).length > 0) {
      parts.push(`${(section[key] as unknown[]).length} ${key}`);
    }
  }
  return parts.join(", ");
}
