"use client";

import { useEffect, useState } from "react";
import { typeLabel } from "@/lib/gss";
import type { GssFile, GssType } from "@/lib/types";

const TYPES: GssType[] = ["baseline", "update", "upgrade", "bug", "virus"];

export default function ScriptEditor({
  script,
  values,
  onSave,
  onDelete,
  onDuplicate,
}: {
  script: GssFile;
  values: string[];
  onSave: (s: GssFile) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const [draft, setDraft] = useState<GssFile>(script);

  useEffect(() => {
    setDraft(script);
  }, [script.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = JSON.stringify(draft) !== JSON.stringify(script);

  const setField = <K extends keyof GssFile>(k: K, v: GssFile[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="panel p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-muted">editing</div>
          <div className="text-matrix crt-text text-xl">
            {draft.name}.gss
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn !py-1 text-xs" onClick={() => onDuplicate(script.id)}>
            duplicate
          </button>
          <button
            className="btn btn-danger !py-1 text-xs"
            onClick={() => {
              if (confirm(`Delete ${script.name}.gss?`)) onDelete(script.id);
            }}
          >
            delete
          </button>
          <button
            className="btn btn-primary !py-1 text-xs"
            disabled={!dirty}
            onClick={() =>
              onSave({ ...draft, updatedAt: new Date().toISOString() })
            }
          >
            {dirty ? "save *" : "saved"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-muted">title</label>
          <input
            value={draft.title}
            onChange={(e) => setField("title", e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted">file name</label>
          <input
            value={draft.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted">type</label>
          <select
            value={draft.type}
            onChange={(e) => setField("type", e.target.value as GssType)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {typeLabel[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted">duration (min)</label>
          <input
            type="number"
            min={0}
            value={draft.durationMin}
            onChange={(e) =>
              setField("durationMin", Number(e.target.value) || 0)
            }
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs text-muted">intent (why)</label>
        <textarea
          rows={2}
          value={draft.intent}
          onChange={(e) => setField("intent", e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="text-xs text-muted">
          steps (one per line)
        </label>
        <textarea
          rows={6}
          value={draft.steps.join("\n")}
          onChange={(e) => setField("steps", e.target.value.split("\n"))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-muted">
            tags (comma separated)
          </label>
          <input
            value={draft.tags.join(", ")}
            onChange={(e) =>
              setField(
                "tags",
                e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean)
              )
            }
          />
        </div>
        <div>
          <label className="text-xs text-muted">linked value</label>
          <select
            value={draft.linkedValue ?? ""}
            onChange={(e) =>
              setField("linkedValue", e.target.value || undefined)
            }
          >
            <option value="">— none —</option>
            {values.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {draft.runs.length > 0 && (
        <div className="mt-6">
          <div className="text-xs text-muted uppercase tracking-widest mb-2">
            // run log
          </div>
          <ul className="text-xs space-y-1">
            {draft.runs
              .slice(-8)
              .reverse()
              .map((r, i) => (
                <li
                  key={i}
                  className={r.completed ? "text-matrix" : "text-muted"}
                >
                  {r.completed ? "✓" : "✗"} {new Date(r.at).toLocaleString()}{" "}
                  · {r.durationMin}m
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
