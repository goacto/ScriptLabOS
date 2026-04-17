"use client";

import { useEffect, useRef, useState } from "react";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import type { Achievement } from "@/lib/types";

interface ShownToast extends Achievement {
  shownAt: number;
}

export default function AchievementToasts() {
  const { state } = useScriptLab();
  const seenRef = useRef<Set<string>>(new Set());
  const initialisedRef = useRef(false);
  const [queue, setQueue] = useState<ShownToast[]>([]);

  // Seed `seen` with everything already unlocked at mount, so we don't toast
  // past achievements on page load.
  useEffect(() => {
    if (initialisedRef.current) return;
    state.achievements.forEach((a) => seenRef.current.add(a.id));
    initialisedRef.current = true;
  }, [state.achievements]);

  useEffect(() => {
    if (!initialisedRef.current) return;
    const fresh = state.achievements.filter(
      (a) => !seenRef.current.has(a.id)
    );
    if (!fresh.length) return;
    fresh.forEach((a) => seenRef.current.add(a.id));
    setQueue((q) => [
      ...q,
      ...fresh.map((a) => ({ ...a, shownAt: Date.now() })),
    ]);
  }, [state.achievements]);

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
