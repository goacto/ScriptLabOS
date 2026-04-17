"use client";

import { useMemo } from "react";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import type { GssFile } from "@/lib/types";

export default function QuickLogWidget() {
  const { state, dispatch } = useScriptLab();

  // Get bugs and viruses
  const badScripts = useMemo(() => {
    return state.scripts.filter(
      (s) => s.type === "bug" || s.type === "virus"
    );
  }, [state.scripts]);

  // Calculate days clean and status for each script
  const scriptStats = useMemo(() => {
    const now = new Date();
    return badScripts.map((script) => {
      const tallies = script.runs.length;
      const lastRun = script.runs.length > 0
        ? script.runs[script.runs.length - 1]
        : null;

      let daysClean = 0;
      let isEliminated = false;

      if (lastRun) {
        const lastRunDate = new Date(lastRun.at);
        const diffMs = now.getTime() - lastRunDate.getTime();
        daysClean = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        isEliminated = daysClean >= 21;
      } else {
        // Never run, calculate from creation
        const createdDate = new Date(script.createdAt);
        const diffMs = now.getTime() - createdDate.getTime();
        daysClean = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        isEliminated = daysClean >= 21;
      }

      return {
        script,
        tallies,
        daysClean,
        isEliminated,
        lastRun,
      };
    });
  }, [badScripts]);

  const activeScripts = scriptStats.filter((s) => !s.isEliminated);
  const eliminatedScripts = scriptStats.filter((s) => s.isEliminated);

  const quickLog = (scriptId: string) => {
    dispatch({
      type: "recordRun",
      scriptId,
      completed: true, // Logging the bad behavior happened
      durationMin: 0, // Quick log = 0 duration
    });
  };

  if (badScripts.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {activeScripts.length > 0 && (
        <div className="panel p-6 mb-4">
          <h2 className="text-lg text-matrix font-bold mb-1">
            🐛 Active Bugs & Viruses
          </h2>
          <p className="text-xs text-muted mb-4">
            Quick-log when you catch yourself running these scripts
          </p>

          <div className="space-y-3">
            {activeScripts.map(({ script, tallies, daysClean, lastRun }) => {
              const isBug = script.type === "bug";
              const icon = isBug ? "🐛" : "🦠";
              const color = isBug ? "text-amber-bug" : "text-virus";

              return (
                <div
                  key={script.id}
                  className="flex items-center justify-between p-3 bg-bg-elev rounded border border-matrix/10"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-lg ${color}`}>{icon}</span>
                      <span className="text-sm font-semibold text-ink">
                        {script.title}
                      </span>
                    </div>
                    <div className="text-xs text-muted">
                      {lastRun ? (
                        <>
                          {daysClean === 0 && "Last: today"}
                          {daysClean === 1 && "Last: yesterday"}
                          {daysClean > 1 && `${daysClean} days clean`}
                          {daysClean >= 7 && daysClean < 21 && (
                            <span className="text-matrix ml-2">
                              🎉 {21 - daysClean} days to elimination!
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-matrix">Never logged</span>
                      )}
                      <span className="mx-1">·</span>
                      <span>{tallies} tallies</span>
                    </div>
                  </div>
                  <button
                    onClick={() => quickLog(script.id)}
                    className="btn !py-1 !px-3 text-xs"
                  >
                    Quick Log
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {eliminatedScripts.length > 0 && (
        <div className="panel p-6 border-matrix/30">
          <h2 className="text-lg text-matrix font-bold mb-1">
            ✅ Eliminated Scripts (21+ days clean)
          </h2>
          <p className="text-xs text-muted mb-4">
            Congrats! These scripts haven't run in 21+ days. Log again to resurrect.
          </p>

          <div className="space-y-2">
            {eliminatedScripts.map(({ script, tallies, daysClean }) => {
              const isBug = script.type === "bug";
              const icon = isBug ? "🐛" : "🦠";

              return (
                <div
                  key={script.id}
                  className="flex items-center justify-between p-2 bg-matrix/5 rounded text-sm"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-muted opacity-50">{icon}</span>
                    <span className="text-ink/70 line-through">
                      {script.title}
                    </span>
                    <span className="text-xs text-muted">
                      · {daysClean} days clean · {tallies} past tallies
                    </span>
                  </div>
                  <button
                    onClick={() => quickLog(script.id)}
                    className="btn !py-1 !px-2 text-xs opacity-70 hover:opacity-100"
                  >
                    Resurrect
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
