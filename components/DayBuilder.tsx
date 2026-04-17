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
  const [drag, setDrag] = useState<
    { kind: "script" | "package"; id: string } | null
  >(null);

  const scriptById = useMemo(
    () => Object.fromEntries(state.scripts.map((s) => [s.id, s])),
    [state.scripts]
  );
  const pkgById = useMemo(
    () => Object.fromEntries(state.packages.map((p) => [p.id, p])),
    [state.packages]
  );

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

  const ships = () => {
    update({ ...exe, status: "passed" });
    dispatch({ type: "passDay" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl text-matrix crt-text font-bold">
            /day — today's executable
          </h1>
          <div className="text-xs text-muted">
            {today} · {exe.status} · {totalMin}m scheduled · ~{totalXp} XP if
            all pass
          </div>
          {warnings.length > 0 && (
            <div className="text-xs text-amber-bug mt-1">
              ⚠ {warnings.join(" · ")}
            </div>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={ships}
          title={
            warnings.length ? "warnings present — ship anyway?" : undefined
          }
        >
          ⏎ compile &amp; ship
        </button>
      </div>

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
                      setSlot(i, {
                        time: slot.time,
                        scriptId: drag.kind === "script" ? drag.id : undefined,
                        packageId:
                          drag.kind === "package" ? drag.id : undefined,
                      });
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
