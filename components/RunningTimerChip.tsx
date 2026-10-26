"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScriptLab } from "@/lib/ScriptLabProvider";
import { formatClock, secondsLeft } from "@/lib/timer";
import { useTimer } from "./TimerProvider";

export default function RunningTimerChip() {
  const pathname = usePathname();
  const { state } = useScriptLab();
  const { ready, now, session } = useTimer();

  if (!ready || now === 0 || !session) return null;
  if (
    session.status !== "running" &&
    session.status !== "paused" &&
    session.status !== "complete"
  ) {
    return null;
  }
  if (pathname === "/tester") return null;

  const left = secondsLeft(session, now);
  const title =
    state.scripts.find((script) => script.id === session.scriptId)?.title ??
    "session";
  const label =
    session.status === "paused"
      ? "paused"
      : session.status === "complete"
        ? "done"
        : "timer";

  return (
    <Link
      href="/tester"
      data-testid="running-timer"
      className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded border border-matrix/50 bg-bg/95 px-4 py-2 shadow-glow"
    >
      <span className="text-[10px] uppercase tracking-widest text-matrix-dim">
        {label}
      </span>
      <span className="text-2xl font-bold tabular-nums text-matrix crt-text">
        {formatClock(left)}
      </span>
      <span className="max-w-[9rem] truncate text-xs text-ink/80">{title}</span>
    </Link>
  );
}
