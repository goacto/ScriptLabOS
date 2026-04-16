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
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const scriptById = useMemo(
    () => Object.fromEntries(state.scripts.map((s) => [s.id, s])),
    [state.scripts]
  );

  const totalXp = exe.slots.reduce((acc, s) => {
    const script = s.scriptId ? scriptById[s.scriptId] : null;
    return script ? acc + xpForRun(script, script.durationMin) : acc;
  }, 0);

  const totalMin = exe.slots.reduce((acc, s) => {
    const script = s.scriptId ? scriptById[s.scriptId] : null;
    return script ? acc + script.durationMin : acc;
  }, 0);

  // A slot overlaps the next if its script's duration spills past the next
  // slot's start time (each slot is 60 min apart in this grid).
  const overlaps = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < exe.slots.length; i++) {
      const slot = exe.slots[i];
      const script = slot.scriptId ? scriptById[slot.scriptId] : null;
      if (!script) continue;
      const slotsNeeded = Math.ceil(script.durationMin / 60);
      for (let j = 1; j < slotsNeeded; j++) {
        const other = exe.slots[i + j];
        if (other?.scriptId) {
          set.add(i);
          set.add(i + j);
        }
      }
    }
    return set;
  }, [exe.slots, scriptById]);

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
            // drag a .gss
          </div>
          <ul className="space-y-1 text-sm max-h-[70vh] overflow-y-auto">
            {state.scripts
              .filter((s) => s.type !== "bug" && s.type !== "virus")
              .map((s) => (
                <li
                  key={s.id}
                  draggable
                  onDragStart={() => setDraggingId(s.id)}
                  onDragEnd={() => setDraggingId(null)}
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
              return (
                <li
                  key={i}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggingId) {
                      setSlot(i, { ...slot, scriptId: draggingId });
                      setDraggingId(null);
                    }
                  }}
                  className={`flex items-center gap-3 border-b border-matrix/10 py-2 ${
                    overlaps.has(i) ? "bg-amber-bug/10" : ""
                  } ${draggingId ? "hover:bg-matrix/10" : ""}`}
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
                  ) : (
                    <span className="flex-1 text-xs text-muted italic">
                      — empty — drop a script here —
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
