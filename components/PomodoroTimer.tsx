"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { typeIcon, typeLabel } from "@/lib/gss";
import { xpForRun } from "@/lib/gamification";
import { primeChime } from "@/lib/chime";
import { formatClock, secondsLeft } from "@/lib/timer";
import { useTimer } from "./TimerProvider";

export default function PomodoroTimer() {
  const { state, dispatch } = useScriptLab();
  const { ready, now, session, begin, pause, reset } = useTimer();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const [scriptId, setScriptId] = useState<string | null>(queryId);
  const [showPomodoroInfo, setShowPomodoroInfo] = useState(false);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [reflection, setReflection] = useState({
    whatWorked: "",
    whatDidnt: "",
    insights: "",
  });
  const booted = useRef(false);
  const seenQuery = useRef<string | null | undefined>(undefined);

  const script = state.scripts.find((s) => s.id === scriptId) ?? null;
  const active =
    session && script && session.scriptId === script.id ? session : null;
  const remaining = active
    ? secondsLeft(active, now || Date.now())
    : (script?.durationMin ?? 25) * 60;
  const running = active?.status === "running";
  const paused = active?.status === "paused";
  const showReflection = active?.status === "complete";

  useEffect(() => {
    if (!ready || booted.current) return;
    booted.current = true;
    const runnable = state.scripts.find(
      (s) => s.type !== "bug" && s.type !== "virus"
    );
    const restored =
      session &&
      session.status !== "idle" &&
      state.scripts.some((s) => s.id === session.scriptId)
        ? session.scriptId
        : null;
    setScriptId(
      restored ??
        (queryId && state.scripts.some((s) => s.id === queryId) ? queryId : null) ??
        runnable?.id ??
        null
    );
  }, [ready, session, queryId, state.scripts]);

  useEffect(() => {
    if (!ready) return;
    if (seenQuery.current === queryId) return;
    const previous = seenQuery.current;
    seenQuery.current = queryId;
    if (previous === undefined) return;
    if (!queryId) return;
    if (session && session.scriptId !== queryId && session.status !== "idle") {
      setScriptId(session.scriptId);
      return;
    }
    setScriptId(queryId);
  }, [queryId, ready, session]);

  useEffect(() => {
    setChecked({});
  }, [scriptId]);

  const handleReflectionSubmit = () => {
    // Require at least one field to be filled
    const hasContent =
      reflection.whatWorked.trim() ||
      reflection.whatDidnt.trim() ||
      reflection.insights.trim();

    if (!hasContent) {
      alert("Please fill in at least one reflection field before logging your session.");
      return;
    }

    if (script) {
      dispatch({
        type: "recordRun",
        scriptId: script.id,
        completed: true,
        durationMin: script.durationMin,
        review: {
          whatWorked: reflection.whatWorked.trim(),
          whatDidnt: reflection.whatDidnt.trim(),
          insights: reflection.insights.trim(),
        },
      });
      reset(script.id, script.durationMin * 60);
    }
    setReflection({ whatWorked: "", whatDidnt: "", insights: "" });
  };

  const canSubmitReflection =
    reflection.whatWorked.trim() ||
    reflection.whatDidnt.trim() ||
    reflection.insights.trim();

  const handleBail = () => {
    if (!script) return;
    const left = active ? secondsLeft(active, Date.now()) : remaining;
    pause();
    const elapsed = Math.max(0, script.durationMin - Math.floor(left / 60));
    dispatch({
      type: "recordRun",
      scriptId: script.id,
      completed: false,
      durationMin: elapsed,
    });
  };

  const percent = script
    ? 1 - remaining / (script.durationMin * 60)
    : 0;

  return (
    <>
      {/* Pomodoro Info Modal */}
      {showPomodoroInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/90 backdrop-blur-sm">
          <div className="panel w-full max-w-2xl p-6 border-matrix shadow-glow">
            <div className="text-xs text-matrix-dim uppercase tracking-[0.35em] mb-1">
              // focus technique
            </div>
            <h2 className="text-2xl text-matrix crt-text font-bold mb-4">
              The Pomodoro Technique
            </h2>

            <div className="space-y-4 text-sm text-ink/90 mb-6">
              <p>
                The <strong className="text-matrix">Pomodoro Technique</strong> is a time management method developed by Francesco Cirillo in the late 1980s. It uses focused work intervals to maximize productivity and maintain mental freshness.
              </p>

              <div className="panel p-4 bg-bg-elev">
                <h3 className="text-sm font-bold text-matrix mb-2">How It Works:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li><strong>Choose a task</strong> you want to work on</li>
                  <li><strong>Set a timer</strong> for 25 minutes (one "Pomodoro")</li>
                  <li><strong>Work with full focus</strong> until the timer rings</li>
                  <li><strong>Take a 5-minute break</strong> to recharge</li>
                  <li><strong>After 4 Pomodoros</strong>, take a longer 15-30 minute break</li>
                </ol>
              </div>

              <p>
                <strong className="text-matrix">Why it works:</strong> The technique leverages time-boxing to create urgency, while regular breaks prevent burnout and maintain peak cognitive performance. The timer creates a sense of commitment—making it easier to resist distractions.
              </p>

              <p className="text-muted text-xs">
                In ScriptLabOS, each script can have its own duration. We recommend 25-minute blocks for deep work, but you can adjust based on your needs.
              </p>
            </div>

            <div className="flex gap-3 justify-between items-center">
              <a
                href="https://grokipedia.com/page/Pomodoro_Technique"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-matrix-dim hover:text-matrix transition-colors"
              >
                📖 Read more on Grokipedia →
              </a>
              <button
                className="btn btn-primary"
                onClick={() => setShowPomodoroInfo(false)}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {showReflection && script && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/90 backdrop-blur-sm">
          <div className="panel w-full max-w-2xl p-6 border-matrix shadow-glow">
            <div className="text-xs text-matrix-dim uppercase tracking-[0.35em] mb-1">
              // session complete — code review required
            </div>
            <h2 className="text-2xl text-matrix crt-text font-bold mb-4">
              Reflect on "{script.title}"
            </h2>
            <p className="text-sm text-muted mb-4">
              Take a moment to review your session. What lines of code in your life worked? What needs debugging? <span className="text-virus">At least one field is required.</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-ink/90 mb-1">
                  ✓ What worked well? (successes, insights, flow states)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Focused deeply for 20 min straight, the breathing technique helped..."
                  value={reflection.whatWorked}
                  onChange={(e) =>
                    setReflection((r) => ({ ...r, whatWorked: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-ink/90 mb-1">
                  ⚠ What didn't work? (bugs, distractions, resistance)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Got distracted by phone notifications, mind wandered..."
                  value={reflection.whatDidnt}
                  onChange={(e) =>
                    setReflection((r) => ({ ...r, whatDidnt: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-ink/90 mb-1">
                  💡 Insights & revisions (what to edit for next run)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Need to turn off notifications first, break into 10-min chunks..."
                  value={reflection.insights}
                  onChange={(e) =>
                    setReflection((r) => ({ ...r, insights: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                className="btn btn-primary"
                onClick={handleReflectionSubmit}
                disabled={!canSubmitReflection}
                title={
                  !canSubmitReflection
                    ? "Fill in at least one field to continue"
                    : undefined
                }
              >
                ⏎ log session
              </button>
            </div>
            <div className="text-xs text-muted text-center mt-3">
              Reflection helps you debug your life and iterate on your scripts.
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl text-matrix crt-text font-bold mb-4">
          /tester — pomodoro runner
        </h1>

      <div className="panel p-4 mb-4">
        <label className="text-xs text-muted">select script</label>
        <select
          value={scriptId ?? ""}
          onChange={(e) => {
            const id = e.target.value || null;
            setScriptId(id);
            if (!id) return;
            const next = state.scripts.find((s) => s.id === id);
            if (!next) return;
            if (session?.scriptId === id && session.status !== "idle") return;
            reset(id, next.durationMin * 60);
            setReflection({ whatWorked: "", whatDidnt: "", insights: "" });
          }}
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
            <div className="text-matrix crt-text text-7xl font-bold tabular-nums" data-testid="timer-clock">
              {formatClock(remaining)}
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
                onClick={() => {
                  primeChime();
                  begin(script.id, script.durationMin * 60);
                }}
                disabled={remaining === 0}
              >
                {paused ? "▶ resume" : "▶ start"}
              </button>
            ) : (
              <button className="btn" onClick={() => pause()}>
                ⏸ pause
              </button>
            )}
            <button
              className="btn"
              onClick={() => {
                reset(script.id, script.durationMin * 60);
                setChecked({});
                setReflection({ whatWorked: "", whatDidnt: "", insights: "" });
              }}
            >
              ⟲ reset
            </button>
            <button className="btn btn-danger" onClick={handleBail}>
              ✗ bail (log partial)
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-matrix/10 text-center">
            <button
              onClick={() => setShowPomodoroInfo(true)}
              className="text-xs text-matrix-dim hover:text-matrix transition-colors"
            >
              ℹ️ Learn about the Pomodoro Technique
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
    </>
  );
}
