"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { typeIcon, typeLabel } from "@/lib/gss";
import { xpForRun } from "@/lib/gamification";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export default function PomodoroTimer() {
  const { state, dispatch } = useScriptLab();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const [scriptId, setScriptId] = useState<string | null>(
    queryId ??
      state.scripts.find((s) => s.type !== "bug" && s.type !== "virus")?.id ??
      null
  );

  useEffect(() => {
    if (queryId && queryId !== scriptId) setScriptId(queryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryId]);
  const script = state.scripts.find((s) => s.id === scriptId) ?? null;
  const [remaining, setRemaining] = useState(
    (script?.durationMin ?? 25) * 60
  );
  const [running, setRunning] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (script) setRemaining(script.durationMin * 60);
    setChecked({});
    setRunning(false);
  }, [scriptId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setRunning(false);
            if (script) {
              dispatch({
                type: "recordRun",
                scriptId: script.id,
                completed: true,
                durationMin: script.durationMin,
              });
            }
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, script, dispatch]);

  const handleBail = () => {
    setRunning(false);
    if (script) {
      const elapsed = Math.max(
        0,
        script.durationMin - Math.floor(remaining / 60)
      );
      dispatch({
        type: "recordRun",
        scriptId: script.id,
        completed: false,
        durationMin: elapsed,
      });
    }
  };

  const percent = script
    ? 1 - remaining / (script.durationMin * 60)
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl text-matrix crt-text font-bold mb-4">
        /tester — pomodoro runner
      </h1>

      <div className="panel p-4 mb-4">
        <label className="text-xs text-muted">select script</label>
        <select
          value={scriptId ?? ""}
          onChange={(e) => setScriptId(e.target.value || null)}
        >
          <option value="">— choose a .gss —</option>
          {state.scripts
            .filter((s) => s.type !== "bug" && s.type !== "virus")
            .map((s) => (
              <option key={s.id} value={s.id}>
                {typeIcon[s.type]} {s.title} ({s.durationMin}m) ·{" "}
                {typeLabel[s.type]}
              </option>
            ))}
        </select>
      </div>

      {script ? (
        <div className="panel p-6">
          <div className="text-xs text-muted mb-1">now running</div>
          <div className="flex items-baseline justify-between mb-4">
            <div className="text-matrix crt-text text-xl">
              {script.title}
            </div>
            <div className="text-xs text-muted">
              would earn ~{xpForRun(script, script.durationMin)} XP
            </div>
          </div>

          <div className="text-center my-8">
            <div className="text-matrix crt-text text-7xl font-bold tabular-nums">
              {fmt(remaining)}
            </div>
            <div className="h-2 bg-bg-elev mt-6 rounded-full overflow-hidden border border-matrix/20">
              <div
                className="h-full bg-matrix shadow-glow-sm transition-all"
                style={{ width: `${percent * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-center mb-8">
            {!running ? (
              <button
                className="btn btn-primary"
                onClick={() => setRunning(true)}
                disabled={remaining === 0}
              >
                ▶ start
              </button>
            ) : (
              <button className="btn" onClick={() => setRunning(false)}>
                ⏸ pause
              </button>
            )}
            <button
              className="btn"
              onClick={() => {
                setRunning(false);
                setRemaining(script.durationMin * 60);
                setChecked({});
              }}
            >
              ⟲ reset
            </button>
            <button className="btn btn-danger" onClick={handleBail}>
              ✗ bail (log partial)
            </button>
          </div>

          {script.intent && (
            <div className="panel p-3 mb-4 text-sm text-ink/90">
              <span className="text-matrix-dim mr-2">intent:</span>
              {script.intent}
            </div>
          )}

          {script.steps.length > 0 && (
            <div>
              <div className="text-xs text-muted uppercase tracking-widest mb-2">
                // steps
              </div>
              <ul className="space-y-1">
                {script.steps.map((s, i) => (
                  <li key={i}>
                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="!w-4 !h-4 mt-1 accent-matrix"
                        checked={!!checked[i]}
                        onChange={(e) =>
                          setChecked((c) => ({
                            ...c,
                            [i]: e.target.checked,
                          }))
                        }
                      />
                      <span
                        className={
                          checked[i] ? "line-through text-muted" : ""
                        }
                      >
                        {s}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="panel p-6 text-muted text-center">
          no runnable scripts yet — create one in the Library first.
        </div>
      )}
    </div>
  );
}
