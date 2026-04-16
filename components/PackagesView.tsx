"use client";

import { useState } from "react";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { typeIcon, uid } from "@/lib/gss";
import type { Package } from "@/lib/types";

export default function PackagesView() {
  const { state, dispatch } = useScriptLab();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const editing = state.packages.find((p) => p.id === editingId) ?? null;

  const startNew = () => {
    const pkg: Package = {
      id: uid(),
      name: "new-package",
      title: "New Package",
      scriptIds: [],
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "addPackage", pkg });
    setEditingId(pkg.id);
    setDraftName(pkg.title);
  };

  const renameTo = (title: string) => {
    if (!editing) return;
    dispatch({
      type: "updatePackage",
      pkg: { ...editing, title, name: title.toLowerCase().replace(/\s+/g, "-") },
    });
  };

  const toggleScript = (scriptId: string) => {
    if (!editing) return;
    const has = editing.scriptIds.includes(scriptId);
    dispatch({
      type: "updatePackage",
      pkg: {
        ...editing,
        scriptIds: has
          ? editing.scriptIds.filter((id) => id !== scriptId)
          : [...editing.scriptIds, scriptId],
      },
    });
  };

  const totalMin = (pkg: Package) =>
    pkg.scriptIds.reduce((acc, id) => {
      const s = state.scripts.find((x) => x.id === id);
      return s ? acc + s.durationMin : acc;
    }, 0);

  const runnable = state.scripts.filter(
    (s) => s.type !== "bug" && s.type !== "virus"
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl text-matrix crt-text font-bold">
            /packages — bundles
          </h1>
          <div className="text-xs text-muted">
            group .gss files into reusable bundles
          </div>
        </div>
        <button className="btn btn-primary" onClick={startNew}>
          + new package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        <div className="panel p-3 h-fit">
          <div className="text-xs text-muted uppercase tracking-widest mb-2 px-1">
            packages
          </div>
          {state.packages.length === 0 && (
            <div className="text-xs text-muted/60 italic px-1">
              no packages yet — create one →
            </div>
          )}
          <ul>
            {state.packages.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => {
                    setEditingId(p.id);
                    setDraftName(p.title);
                  }}
                  className={`w-full text-left px-2 py-1 rounded ${
                    editingId === p.id
                      ? "bg-matrix/15 text-matrix crt-text"
                      : "hover:bg-matrix/5 text-ink/80"
                  }`}
                >
                  📦 {p.title}
                  <span className="text-xs text-muted ml-2">
                    {p.scriptIds.length} · {totalMin(p)}m
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {editing ? (
          <div className="panel p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 mr-4">
                <label className="text-xs text-muted">package name</label>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => renameTo(draftName.trim() || "Untitled")}
                />
              </div>
              <button
                className="btn btn-danger !py-1 text-xs mt-5"
                onClick={() => {
                  if (confirm(`Delete package "${editing.title}"?`)) {
                    dispatch({ type: "deletePackage", id: editing.id });
                    setEditingId(null);
                  }
                }}
              >
                delete
              </button>
            </div>

            <div className="text-xs text-muted uppercase tracking-widest mb-2">
              // included scripts
            </div>
            {runnable.length === 0 ? (
              <div className="text-sm text-muted italic">
                no runnable scripts in your library yet.
              </div>
            ) : (
              <ul className="space-y-1">
                {runnable.map((s) => {
                  const on = editing.scriptIds.includes(s.id);
                  return (
                    <li key={s.id}>
                      <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-matrix/5 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          className="!w-4 !h-4 accent-matrix"
                          checked={on}
                          onChange={() => toggleScript(s.id)}
                        />
                        <span className="text-[10px] text-muted">
                          {typeIcon[s.type]}
                        </span>
                        <span className="flex-1">{s.title}</span>
                        <span className="text-xs text-muted">
                          {s.durationMin}m
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-4 text-xs text-muted">
              total: {totalMin(editing)} min · {editing.scriptIds.length}{" "}
              script(s)
            </div>
          </div>
        ) : (
          <div className="panel p-6 flex items-center justify-center text-muted">
            select a package or create a new one →
          </div>
        )}
      </div>
    </div>
  );
}
