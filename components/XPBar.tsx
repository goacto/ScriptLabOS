"use client";

import { levelFor } from "@/lib/gamification";

export default function XPBar({ xp }: { xp: number }) {
  const { current, next, progress } = levelFor(xp);
  return (
    <div>
      <div className="flex justify-between text-xs text-muted mb-1">
        <span className="text-matrix">{current.name}</span>
        <span>
          {xp} / {next.threshold} XP
        </span>
      </div>
      <div className="h-2 bg-bg-elev rounded-full overflow-hidden border border-matrix/20">
        <div
          className="h-full bg-matrix shadow-glow-sm transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      {current.name !== next.name && (
        <div className="text-[10px] text-muted mt-1">
          next: {next.name}
        </div>
      )}
    </div>
  );
}
