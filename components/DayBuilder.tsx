"use client";

import { useMemo, useRef, useState } from "react";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { uid, typeIcon } from "@/lib/gss";
import { isOnLocalDay, todayStr } from "@/lib/dates";
import { xpForRun } from "@/lib/gamification";
import { canShipDay } from "@/lib/reflection";
import { workbookUrl } from "@/lib/workbookLink";
import type { Executable, ExecutableSlot } from "@/lib/types";

const HOURS = Array.from({ length: 18 }, (_, i) => 5 + i); // 05:00 – 22:00

type PaletteItem = { kind: "script" | "package"; id: string };

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
  const [justShipped, setJustShipped] = useState(false);
  const [dailyReflection, setDailyReflection] = useState({
    wins: "",
    challenges: "",
    tomorrowFocus: "",
  });
  const [drag, setDrag] = useState<PaletteItem | null>(null);
  const [picked, setPicked] = useState<PaletteItem | null>(null);
  const suppressClick = useRef(false);

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
            run.completed && isOnLocalDay(run.at, today)
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

  const placeItem = (index: number, item: PaletteItem) => {
    const newSlot: ExecutableSlot = {
      time: exe.slots[index].time,
      scriptId: item.kind === "script" ? item.id : undefined,
      packageId: item.kind === "package" ? item.id : undefined,
    };
    let durationMin = 0;
    if (item.kind === "script" && scriptById[item.id]) {
      durationMin = scriptById[item.id].durationMin;
    } else if (item.kind === "package" && pkgById[item.id]) {
      durationMin = pkgById[item.id].scriptIds.reduce(
        (acc, id) => acc + (scriptById[id]?.durationMin ?? 0),
        0
      );
    }
    const slotsNeeded = Math.ceil(durationMin / 60);
    const newSlots = [...exe.slots];
    newSlots[index] = newSlot;
    for (let j = 1; j < slotsNeeded; j++) {
      if (index + j < newSlots.length) {
        newSlots[index + j] = { time: newSlots[index + j].time };
      }
    }
    update({ ...exe, slots: newSlots });
    setDrag(null);
    setPicked(null);
  };

  const togglePick = (item: PaletteItem) => {
    setPicked((current) =>
      current && current.kind === item.kind && current.id === item.id
        ? null
        : item
    );
  };

  const pickedLabel = picked
    ? picked.kind === "script"
      ? scriptById[picked.id]?.title ?? "script"
      : pkgById[picked.id]?.title ?? "package"
    : null;

  const canShip = canShipDay(dailyReflection);

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
            run.completed && isOnLocalDay(run.at, today)
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
    setJustShipped(true);
    setDailyReflection({ wins: "", challenges: "", tomorrowFocus: "" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex-1">
          <h1 className="text-2xl text-matrix crt-text font-bold">
            /day — Daily Build Plan
          </h1>
          <div className="text-xs text-muted">
            {today} · Status: <span className="capitalize">{exe.status}</span> · {totalMin}m planned · ~{totalXp} XP potential
          </div>
          {exe.status === "in-progress" && plannedScriptIds.length > 0 && (
            <div className="text-xs text-matrix mt-1">
              📝 Ran so far: {completedTodayScriptIds.filter((id) => plannedScriptIds.includes(id)).length} of {plannedScriptIds.length} planned scripts
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
              <h3 className="text-sm font-bold text-ink/90 mb-2">What ran today</h3>
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
                  <span className="text-muted">Planned vs ran:</span>
                  <span className="text-ink/90">
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
              Write down what actually ran, word for word if you can. Don&apos;t grade it. <span className="text-muted">The first two are required; tomorrow&apos;s focus is optional.</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-ink/90 mb-1">
                  📝 What actually ran today?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Morning breath at 6:10, deep work until the 10:00 call..."
                  value={dailyReflection.wins}
                  onChange={(e) =>
                    setDailyReflection((r) => ({ ...r, wins: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-ink/90 mb-1">
                  👀 What ran instead, or didn&apos;t run?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Checked the phone at lunch, evening walk didn&apos;t happen..."
                  value={dailyReflection.challenges}
                  onChange={(e) =>
                    setDailyReflection((r) => ({ ...r, challenges: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-ink/90 mb-1">
                  🎯 Tomorrow&apos;s focus (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Leave blank if nothing comes to mind."
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
                disabled={!canShip}
                title={
                  canShip
                    ? undefined
                    : "Write what ran and what ran instead to ship the day"
                }
              >
                🚀 Ship Today's Build
              </button>
            </div>
            <div className="text-xs text-muted text-center mt-3">
              This is what the day was made of.
            </div>
          </div>
        </div>
      )}

      {justShipped && (
        <div className="mb-4 panel p-3 text-sm text-muted" data-testid="post-reflection">
          Day shipped. If paper helps, there&apos;s a{" "}
          <a
            data-testid="workbook-quiet-link"
            href={workbookUrl()}
            target="_blank"
            rel="noopener"
            className="underline text-ink/80"
          >
            30-Day Habit Builder Workbook ($7)
          </a>
          .
        </div>
      )}

      <div className="grid md:grid-cols-[260px_1fr] gap-4">
        <div className="panel p-3 h-fit md:sticky md:top-20">
          <div className="text-xs text-muted uppercase tracking-widest mb-2">
            // tap or drag a .gss or 📦
          </div>
          {pickedLabel && (
            <div className="text-xs text-matrix mb-2">
              Selected {pickedLabel}. Tap an hour to add it.
            </div>
          )}
          <ul className="space-y-1 text-sm max-h-[70vh] overflow-y-auto">
            {state.packages.map((p) => {
              const min = p.scriptIds.reduce(
                (a, id) => a + (scriptById[id]?.durationMin ?? 0),
                0
              );
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    draggable
                    data-testid={`palette-${p.id}`}
                    aria-pressed={picked?.kind === "package" && picked.id === p.id}
                    onDragStart={(e) => {
                      suppressClick.current = true;
                      setDrag({ kind: "package", id: p.id });
                      e.dataTransfer?.setData("text/plain", p.id);
                    }}
                    onDragEnd={() => {
                      setDrag(null);
                      setTimeout(() => {
                        suppressClick.current = false;
                      }, 0);
                    }}
                    onClick={() => {
                      if (suppressClick.current) return;
                      togglePick({ kind: "package", id: p.id });
                    }}
                    className={`w-full text-left min-h-11 px-2 py-2 border rounded cursor-pointer ${
                      picked?.kind === "package" && picked.id === p.id
                        ? "border-matrix bg-matrix/15"
                        : "border-matrix/30 hover:bg-matrix/10"
                    }`}
                  >
                  📦 {p.title}
                  <span className="text-xs text-muted ml-2">
                    {p.scriptIds.length} · {min}m
                  </span>
                  </button>
                </li>
              );
            })}
            {state.scripts
              .filter((s) => s.type !== "bug" && s.type !== "virus")
              .map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    draggable
                    data-testid={`palette-${s.id}`}
                    aria-pressed={picked?.kind === "script" && picked.id === s.id}
                    onDragStart={(e) => {
                      suppressClick.current = true;
                      setDrag({ kind: "script", id: s.id });
                      e.dataTransfer?.setData("text/plain", s.id);
                    }}
                    onDragEnd={() => {
                      setDrag(null);
                      setTimeout(() => {
                        suppressClick.current = false;
                      }, 0);
                    }}
                    onClick={() => {
                      if (suppressClick.current) return;
                      togglePick({ kind: "script", id: s.id });
                    }}
                    className={`w-full text-left min-h-11 px-2 py-2 border rounded cursor-pointer ${
                      picked?.kind === "script" && picked.id === s.id
                        ? "border-matrix bg-matrix/15"
                        : "border-matrix/20 hover:bg-matrix/10"
                    }`}
                  >
                  <span className="text-[10px] text-muted mr-1">
                    {typeIcon[s.type]}
                  </span>
                  {s.name}.gss
                  <span className="text-xs text-muted ml-2">
                    {s.durationMin}m
                  </span>
                  </button>
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
                  data-testid={`day-slot-${slot.time}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (drag) placeItem(i, drag);
                  }}
                  onClick={() => {
                    if (picked) placeItem(i, picked);
                  }}
                  onKeyDown={(e) => {
                    if (!picked) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      placeItem(i, picked);
                    }
                  }}
                  tabIndex={picked ? 0 : undefined}
                  aria-label={
                    pickedLabel ? `Add ${pickedLabel} at ${slot.time}` : undefined
                  }
                  className={`flex items-center gap-3 border-b border-matrix/10 py-2 min-h-11 ${
                    overlaps.has(i) ? "bg-amber-bug/10" : ""
                  } ${drag || picked ? "hover:bg-matrix/10 cursor-pointer" : ""}`}
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
                        className="btn btn-danger !py-1 !px-3 text-xs min-h-11"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlot(i, { time: slot.time });
                        }}
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
                        className="btn btn-danger !py-1 !px-3 text-xs min-h-11"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlot(i, { time: slot.time });
                        }}
                      >
                        clear
                      </button>
                    </>
                  ) : (
                    <span className="flex-1 text-xs text-muted italic">
                      {pickedLabel
                        ? `— tap to add ${pickedLabel} —`
                        : "— tap a script, then tap here — or drop one —"}
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
