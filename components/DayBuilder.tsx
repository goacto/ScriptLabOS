"use client";

import { useMemo, useState } from "react";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { uid, typeIcon } from "@/lib/gss";
import { xpForRun } from "@/lib/gamification";
import type { Executable, ExecutableSlot } from "@/lib/types";

const HOURS = Array.from({ length: 18 }, (_, i) => 5 + i); // 05:00 – 22:00

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DayBuilder() {
  const { state, dispatch } = useScriptLab();
  const today = todayStr();
  const existing = state.executables.find((e) => e.date === today);

  const [exe, setExe] = useState<Executable>(
    existing ?? {
      id: uid(),
      date: today,
      slots: HOURS.map((h) => ({
        time: `${String(h).padStart(2, "0")}:00`,
      })),
      status: "draft",
    }
  );

  const [showReview, setShowReview] = useState(false);
  const [dailyReflection, setDailyReflection] = useState({
    wins: "",
    challenges: "",
    tomorrowFocus: "",
  });
  const [drag, setDrag] = useState<
    { kind: "script" | "package"; id: string } | null
  >(null);

  // Create lookup maps first
  const scriptById = useMemo(
    () => Object.fromEntries(state.scripts.map((s) => [s.id, s])),
    [state.scripts]
  );
  const pkgById = useMemo(
    () => Object.fromEntries(state.packages.map((p) => [p.id, p])),
    [state.packages]
  );

  // Calculate planned vs completed
  const plannedScriptIds = useMemo(() => {
    const ids = new Set<string>();
    exe.slots.forEach((slot) => {
      if (slot.scriptId) ids.add(slot.scriptId);
      if (slot.packageId && pkgById[slot.packageId]) {
        pkgById[slot.packageId].scriptIds.forEach((id) => ids.add(id));
      }
    });
    return Array.from(ids);
  }, [exe.slots, pkgById]);

  const completedTodayScriptIds = useMemo(() => {
    return state.scripts
      .filter((script) => {
        const todayRuns = script.runs.filter(
          (run) =>
            run.completed &&
            new Date(run.at).toISOString().slice(0, 10) === today
        );
        return todayRuns.length > 0;
      })
      .map((s) => s.id);
  }, [state.scripts, today]);

  const executionFidelity = plannedScriptIds.length > 0
    ? Math.round((completedTodayScriptIds.filter((id) => plannedScriptIds.includes(id)).length / plannedScriptIds.length) * 100)
    : 0;

  const slotMinutes = (slot: ExecutableSlot): number => {
    if (slot.scriptId && scriptById[slot.scriptId])
      return scriptById[slot.scriptId].durationMin;
    if (slot.packageId && pkgById[slot.packageId]) {
      return pkgById[slot.packageId].scriptIds.reduce(
        (acc, id) => acc + (scriptById[id]?.durationMin ?? 0),
        0
      );
    }
    return 0;
  };

  const slotXp = (slot: ExecutableSlot): number => {
    if (slot.scriptId && scriptById[slot.scriptId]) {
      const s = scriptById[slot.scriptId];
      return xpForRun(s, s.durationMin);
    }
    if (slot.packageId && pkgById[slot.packageId]) {
      return pkgById[slot.packageId].scriptIds.reduce((acc, id) => {
        const s = scriptById[id];
        return s ? acc + xpForRun(s, s.durationMin) : acc;
      }, 0);
    }
    return 0;
  };

  const totalXp = exe.slots.reduce((acc, s) => acc + slotXp(s), 0);
  const totalMin = exe.slots.reduce((acc, s) => acc + slotMinutes(s), 0);

  // A slot overlaps the next if its content's duration spills past the next
  // slot's start time (each slot is 60 min apart in this grid).
  const overlaps = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < exe.slots.length; i++) {
      const minutes = slotMinutes(exe.slots[i]);
      if (!minutes) continue;
      const slotsNeeded = Math.ceil(minutes / 60);
      for (let j = 1; j < slotsNeeded; j++) {
        const other = exe.slots[i + j];
        if (other?.scriptId || other?.packageId) {
          set.add(i);
          set.add(i + j);
        }
      }
    }
    return set;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exe.slots, scriptById, pkgById]);

  const warnings = useMemo(() => {
    const w: string[] = [];
    if (overlaps.size) w.push(`${overlaps.size / 2 || 1} overlapping slot(s)`);
    if (totalMin > 24 * 60) w.push(`total ${totalMin}m exceeds 24h`);
    return w;
  }, [overlaps, totalMin]);

  const update = (next: Executable) => {
    setExe(next);
    dispatch({ type: "upsertExecutable", exe: next });
  };

  const setSlot = (i: number, slot: ExecutableSlot) => {
    update({ ...exe, slots: exe.slots.map((s, j) => (i === j ? slot : s)) });
  };

  const startDay = () => {
    update({ ...exe, status: "in-progress" });
  };

  const completeDay = () => {
    setShowReview(true);
  };

  const shipDay = () => {
    const completedScriptIds = state.scripts
      .filter((script) => {
        const todayRuns = script.runs.filter(
          (run) =>
            run.completed &&
            new Date(run.at).toISOString().slice(0, 10) === today
        );
        return todayRuns.length > 0;
      })
      .map((s) => s.id);

    const updatedExe: Executable = {
      ...exe,
      status: "complete",
      completedScriptIds,
      reflection: dailyReflection,
      completedAt: new Date().toISOString(),
    };

    update(updatedExe);
    dispatch({ type: "passDay" });
    setShowReview(false);
    setDailyReflection({ wins: "", challenges: "", tomorrowFocus: "" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-2xl text-matrix crt-text font-bold">
            /day — Daily Build Plan
          </h1>
          <div className="text-xs text-muted">
            {today} · Status: <span className="capitalize">{exe.status}</span> · {totalMin}m planned · ~{totalXp} XP potential
          </div>
          {exe.status === "in-progress" && plannedScriptIds.length > 0 && (
            <div className="text-xs text-matrix mt-1">
              📊 Execution Fidelity: {executionFidelity}% ({completedTodayScriptIds.filter((id) => plannedScriptIds.includes(id)).length}/{plannedScriptIds.length} scripts completed)
            </div>
          )}
          {warnings.length > 0 && (
            <div className="text-xs text-amber-bug mt-1">
              ⚠ {warnings.join(" · ")}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {exe.status === "draft" && (
            <button
              className="btn btn-primary"
              onClick={startDay}
              disabled={plannedScriptIds.length === 0}
              title={plannedScriptIds.length === 0 ? "Add scripts to your plan first" : "Begin executing today's plan"}
            >
              ▶ Start Day
            </button>
          )}
          {exe.status === "in-progress" && (
            <button
              className="btn btn-primary"
              onClick={completeDay}
              title="Review and complete today's build"
            >
              ✓ Complete Day
            </button>
          )}
          {exe.status === "complete" && (
            <div className="text-sm text-matrix">
              ✓ Shipped on {exe.completedAt ? new Date(exe.completedAt).toLocaleString() : "today"}
            </div>
          )}
        </div>
      </div>

      {/* End-of-Day Review Modal */}
      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/90 backdrop-blur-sm">
          <div className="panel w-full max-w-2xl p-6 border-matrix shadow-glow">
            <div className="text-xs text-matrix-dim uppercase tracking-[0.35em] mb-1">
              // daily build complete — final review
            </div>
            <h2 className="text-2xl text-matrix crt-text font-bold mb-4">
              Ship Today's Build
            </h2>

            <div className="mb-6 panel p-4 bg-bg-elev">
              <h3 className="text-sm font-bold text-ink/90 mb-2">Build Quality Report</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Planned Scripts:</span>
                  <span className="text-ink/90">{plannedScriptIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Completed:</span>
                  <span className="text-ink/90">{completedTodayScriptIds.filter((id) => plannedScriptIds.includes(id)).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Execution Fidelity:</span>
                  <span className={`font-bold ${executionFidelity >= 80 ? "text-matrix" : executionFidelity >= 50 ? "text-amber-bug" : "text-virus"}`}>
                    {executionFidelity}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">XP Earned:</span>
                  <span className="text-matrix">~{Math.round(totalXp * (executionFidelity / 100))}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted mb-4">
              Reflect on your day. This helps you iterate and improve your scripts. <span className="text-virus">All fields required.</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-ink/90 mb-1">
                  🏆 What were your wins today?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Completed morning meditation, stayed focused during deep work..."
                  value={dailyReflection.wins}
                  onChange={(e) =>
                    setDailyReflection((r) => ({ ...r, wins: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-ink/90 mb-1">
                  🐛 What were your challenges or bugs?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Got distracted by notifications, skipped evening reflection..."
                  value={dailyReflection.challenges}
                  onChange={(e) =>
                    setDailyReflection((r) => ({ ...r, challenges: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-ink/90 mb-1">
                  🎯 What's your focus for tomorrow?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Turn off phone during focus sessions, add buffer time between tasks..."
                  value={dailyReflection.tomorrowFocus}
                  onChange={(e) =>
                    setDailyReflection((r) => ({ ...r, tomorrowFocus: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                className="btn"
                onClick={() => setShowReview(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={shipDay}
                disabled={
                  !dailyReflection.wins.trim() ||
                  !dailyReflection.challenges.trim() ||
                  !dailyReflection.tomorrowFocus.trim()
                }
                title={
                  !dailyReflection.wins.trim() ||
                  !dailyReflection.challenges.trim() ||
                  !dailyReflection.tomorrowFocus.trim()
                    ? "All reflection fields are required"
                    : undefined
                }
              >
                🚀 Ship Today's Build
              </button>
            </div>
            <div className="text-xs text-muted text-center mt-3">
              Your daily reflection helps you grow and contribute more effectively.
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-[260px_1fr] gap-4">
        <div className="panel p-3 h-fit sticky top-20">
          <div className="text-xs text-muted uppercase tracking-widest mb-2">
            // drag a .gss or 📦
          </div>
          <ul className="space-y-1 text-sm max-h-[70vh] overflow-y-auto">
            {state.packages.map((p) => {
              const min = p.scriptIds.reduce(
                (a, id) => a + (scriptById[id]?.durationMin ?? 0),
                0
              );
              return (
                <li
                  key={p.id}
                  draggable
                  onDragStart={() => setDrag({ kind: "package", id: p.id })}
                  onDragEnd={() => setDrag(null)}
                  className="px-2 py-1 border border-matrix/30 rounded hover:bg-matrix/10 cursor-grab"
                >
                  📦 {p.title}
                  <span className="text-xs text-muted ml-2">
                    {p.scriptIds.length} · {min}m
                  </span>
                </li>
              );
            })}
            {state.scripts
              .filter((s) => s.type !== "bug" && s.type !== "virus")
              .map((s) => (
                <li
                  key={s.id}
                  draggable
                  onDragStart={() => setDrag({ kind: "script", id: s.id })}
                  onDragEnd={() => setDrag(null)}
                  className="px-2 py-1 border border-matrix/20 rounded hover:bg-matrix/10 cursor-grab"
                >
                  <span className="text-[10px] text-muted mr-1">
                    {typeIcon[s.type]}
                  </span>
                  {s.name}.gss
                  <span className="text-xs text-muted ml-2">
                    {s.durationMin}m
                  </span>
                </li>
              ))}
          </ul>
        </div>

        <div className="panel p-3">
          <ul>
            {exe.slots.map((slot, i) => {
              const script = slot.scriptId ? scriptById[slot.scriptId] : null;
              const pkg = slot.packageId ? pkgById[slot.packageId] : null;
              return (
                <li
                  key={i}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (drag) {
                      const newSlot: ExecutableSlot = {
                        time: slot.time,
                        scriptId: drag.kind === "script" ? drag.id : undefined,
                        packageId:
                          drag.kind === "package" ? drag.id : undefined,
                      };

                      // Calculate how many slots this item needs
                      let durationMin = 0;
                      if (drag.kind === "script" && scriptById[drag.id]) {
                        durationMin = scriptById[drag.id].durationMin;
                      } else if (drag.kind === "package" && pkgById[drag.id]) {
                        durationMin = pkgById[drag.id].scriptIds.reduce(
                          (acc, id) => acc + (scriptById[id]?.durationMin ?? 0),
                          0
                        );
                      }

                      const slotsNeeded = Math.ceil(durationMin / 60);
                      const newSlots = [...exe.slots];

                      // Set the dropped item in the current slot
                      newSlots[i] = newSlot;

                      // Clear the following slots that will be occupied
                      for (let j = 1; j < slotsNeeded; j++) {
                        if (i + j < newSlots.length) {
                          newSlots[i + j] = { time: newSlots[i + j].time };
                        }
                      }

                      update({ ...exe, slots: newSlots });
                      setDrag(null);
                    }
                  }}
                  className={`flex items-center gap-3 border-b border-matrix/10 py-2 ${
                    overlaps.has(i) ? "bg-amber-bug/10" : ""
                  } ${drag ? "hover:bg-matrix/10" : ""}`}
                >
                  <span className="text-matrix-dim w-14 text-sm">
                    {slot.time}
                  </span>
                  {script ? (
                    <>
                      <span className="flex-1 text-sm">
                        <span className="text-[10px] text-muted mr-1">
                          {typeIcon[script.type]}
                        </span>
                        {script.title}
                        <span className="text-xs text-muted ml-2">
                          ({script.durationMin}m)
                        </span>
                      </span>
                      <button
                        className="btn btn-danger !py-0.5 !px-2 text-xs"
                        onClick={() => setSlot(i, { time: slot.time })}
                      >
                        clear
                      </button>
                    </>
                  ) : pkg ? (
                    <>
                      <span className="flex-1 text-sm">
                        📦 {pkg.title}
                        <span className="text-xs text-muted ml-2">
                          ({pkg.scriptIds.length} scripts ·{" "}
                          {slotMinutes(slot)}m)
                        </span>
                      </span>
                      <button
                        className="btn btn-danger !py-0.5 !px-2 text-xs"
                        onClick={() => setSlot(i, { time: slot.time })}
                      >
                        clear
                      </button>
                    </>
                  ) : (
                    <span className="flex-1 text-xs text-muted italic">
                      — empty — drop a script or 📦 here —
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
