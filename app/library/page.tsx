"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import FileTree from "@/components/FileTree";
import ScriptEditor from "@/components/ScriptEditor";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { makeGss, typeLabel } from "@/lib/gss";
import { TEMPLATES, templateToGss } from "@/lib/templates";
import { recommendTemplates } from "@/lib/recommendations";
import type { GssType } from "@/lib/types";

export default function LibraryPage() {
  const { state, dispatch, hydrated } = useScriptLab();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (hydrated && !state.profile) router.replace("/onboard");
  }, [hydrated, state.profile, router]);

  useEffect(() => {
    if (!selectedId && state.scripts[0]) setSelectedId(state.scripts[0].id);
  }, [state.scripts, selectedId]);

  const ownedTitles = useMemo(
    () => new Set(state.scripts.map((s) => s.title)),
    [state.scripts]
  );
  const recommendations = useMemo(
    () =>
      state.profile
        ? recommendTemplates(state.profile, ownedTitles)
        : [],
    [state.profile, ownedTitles]
  );

  if (!hydrated || !state.profile) return null;

  const selected = state.scripts.find((s) => s.id === selectedId) ?? null;

  const handleNew = (type: GssType) => {
    const script = makeGss({
      title: `new ${type}`,
      type,
      durationMin: type === "bug" || type === "virus" ? 0 : 25,
      intent: "",
      steps: [],
      tags: [],
    });
    dispatch({ type: "addScript", script });
    setSelectedId(script.id);
  };

  const handleDuplicate = (id: string) => {
    const src = state.scripts.find((s) => s.id === id);
    if (!src) return;
    const copy = makeGss({
      ...src,
      title: src.title + " (copy)",
      name: src.name + "-copy",
    });
    dispatch({ type: "addScript", script: copy });
    setSelectedId(copy.id);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: "deleteScript", id });
    setSelectedId(null);
  };

  return (
    <>
      <NavBar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl text-matrix crt-text font-bold">
            /library — .gss editor
          </h1>
          <button
            className="btn text-xs"
            onClick={() => setShowTemplates((v) => !v)}
          >
            {showTemplates ? "hide" : "import"} templates
          </button>
        </div>

        {recommendations.length > 0 && (
          <div className="panel p-4 mb-4 border-matrix/40">
            <div className="text-xs text-muted uppercase tracking-widest mb-3">
              // recommended for your wake-ups
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {recommendations.map((r) => (
                <button
                  key={r.template.id}
                  className="panel p-3 text-left hover:shadow-glow-sm border-matrix/40"
                  onClick={() => {
                    const s = templateToGss(r.template);
                    dispatch({ type: "addScript", script: s });
                    setSelectedId(s.id);
                  }}
                >
                  <div className="flex justify-between">
                    <span className="text-matrix">{r.template.title}</span>
                    <span className="text-xs text-matrix-dim">
                      ★ {r.score} match
                    </span>
                  </div>
                  <div className="text-xs text-ink/70 mt-1">
                    {r.template.intent}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.matched.slice(0, 4).map((m) => (
                      <span key={m} className="tag">
                        {m}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {showTemplates && (
          <div className="panel p-4 mb-4">
            <div className="text-xs text-muted uppercase tracking-widest mb-3">
              // curated templates
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  className="panel p-3 text-left hover:shadow-glow-sm"
                  onClick={() => {
                    const s = templateToGss(t);
                    dispatch({ type: "addScript", script: s });
                    setSelectedId(s.id);
                    setShowTemplates(false);
                  }}
                >
                  <div className="flex justify-between">
                    <span className="text-matrix">{t.title}</span>
                    <span className="text-xs text-muted">
                      {typeLabel[t.type]} · {t.durationMin}m
                    </span>
                  </div>
                  <div className="text-xs text-ink/70 mt-1">{t.intent}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 h-[70vh]">
          <FileTree
            scripts={state.scripts}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onNew={handleNew}
          />
          {selected ? (
            <ScriptEditor
              script={selected}
              values={state.profile.values}
              onSave={(s) => dispatch({ type: "updateScript", script: s })}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ) : (
            <div className="panel p-6 flex items-center justify-center text-muted">
              select a file or create a new one →
            </div>
          )}
        </div>
      </div>
    </>
  );
}
