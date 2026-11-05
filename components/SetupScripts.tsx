"use client";

import { useMemo, useState } from "react";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { TEMPLATES, templateToGss } from "@/lib/templates";
import { SETUP_SCRIPTS_LABEL, unownedTemplates } from "@/lib/onboarding";

export default function SetupScripts() {
  const { state, dispatch } = useScriptLab();
  const available = useMemo(
    () => unownedTemplates(state.scripts),
    [state.scripts]
  );
  const [picked, setPicked] = useState<Set<string>>(
    () => new Set(TEMPLATES.map((template) => template.id))
  );

  const add = () => {
    available
      .filter((template) => picked.has(template.id))
      .forEach((template) => {
        dispatch({ type: "addScript", script: templateToGss(template) });
      });
  };

  const selectedCount = available.filter((template) => picked.has(template.id)).length;

  return (
    <div className="panel p-6" id="set-up-my-scripts">
      <h2 className="text-lg text-matrix font-bold mb-1">{SETUP_SCRIPTS_LABEL}</h2>
      <p className="text-xs text-muted mb-4">
        Add starter habits, or write your own in the Library. A sample day
        already includes these if you skipped setup.
      </p>
      <div className="grid gap-2">
        {TEMPLATES.map((template) => {
          const owned = !available.some((item) => item.id === template.id);
          const on = owned || picked.has(template.id);
          return (
            <button
              key={template.id}
              type="button"
              disabled={owned}
              aria-pressed={on}
              onClick={() =>
                setPicked((current) => {
                  const next = new Set(current);
                  if (next.has(template.id)) next.delete(template.id);
                  else next.add(template.id);
                  return next;
                })
              }
              className={`text-left min-h-11 px-3 py-2 rounded border text-sm ${
                owned
                  ? "border-matrix/20 text-muted"
                  : on
                    ? "border-matrix bg-matrix/10 text-ink"
                    : "border-matrix/30 text-ink/80"
              }`}
            >
              <span className="font-bold">{template.title}</span>
              <span className="text-xs text-muted ml-2">
                {owned ? "in your library" : `${template.durationMin}m · ${template.type}`}
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="btn btn-primary min-h-11 mt-4"
        disabled={selectedCount === 0}
        onClick={add}
      >
        {available.length === 0
          ? "Already in your library"
          : selectedCount === 0
            ? "Select scripts to add"
            : `Add ${selectedCount} scripts`}
      </button>
    </div>
  );
}
