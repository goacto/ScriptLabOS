"use client";

import { useEffect, useRef, useState } from "react";
import { partitionAchievements } from "@/lib/achievements";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import type { Achievement } from "@/lib/types";

interface ShownToast extends Achievement {
  shownAt: number;
}

export default function AchievementToasts() {
  const { state, hydrated } = useScriptLab();
  const seenRef = useRef<Set<string>>(new Set());
  const initialisedRef = useRef(false);
  const [queue, setQueue] = useState<ShownToast[]>([]);

  // The provider mounts with an empty list, then hydrates from localStorage.
  // Seed "seen" on the first hydrated pass so saved achievements don't toast.
  useEffect(() => {
    const result = partitionAchievements(
      seenRef.current,
      state.achievements ?? [],
      hydrated,
      initialisedRef.current
    );
    initialisedRef.current = result.initialized;
    if (!result.markSeen.length) return;
    result.markSeen.forEach((a) => seenRef.current.add(a.id));
    if (!result.announce.length) return;
    setQueue((q) => [
      ...q,
      ...result.announce.map((a) => ({ ...a, shownAt: Date.now() })),
    ]);
  }, [hydrated, state.achievements]);

  useEffect(() => {
    if (!queue.length) return;
    const t = setTimeout(() => {
      setQueue((q) => q.slice(1));
    }, 4500);
    return () => clearTimeout(t);
  }, [queue]);

  if (!queue.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {queue.map((t, index) => (
        <div
          key={`${t.id}-${t.shownAt}`}
          role="status"
          style={{
            animation: "slideInRight 0.4s ease-out, flicker 2.5s infinite",
            animationDelay: `${index * 0.1}s`,
          }}
          className="panel px-4 py-3 min-w-[260px] border-matrix shadow-glow pointer-events-auto"
        >
          <div className="text-[10px] text-matrix-dim uppercase tracking-[0.35em]">
            // achievement unlocked
          </div>
          <div className="text-matrix crt-text font-bold">★ {t.title}</div>
          <div className="text-xs text-ink/80">{t.description}</div>
        </div>
      ))}
    </div>
  );
}
