/**
 * A session timer stored as a start timestamp plus a budget.
 * Remaining time is always derived from the clock. Nothing counts ticks.
 */

export type TimerStatus = "idle" | "running" | "paused" | "complete";

export interface SessionTimer {
  scriptId: string;
  durationSec: number;
  /** Epoch ms when the current running segment began. Null unless running or just finished. */
  startedAt: number | null;
  /** Seconds that were remaining at `startedAt`. */
  budgetSec: number;
  /** Frozen remaining seconds while idle or paused. */
  remainingSec: number;
  status: TimerStatus;
}

export function idleSession(scriptId: string, durationSec: number): SessionTimer {
  const duration = Math.max(0, Math.round(durationSec));
  return {
    scriptId,
    durationSec: duration,
    startedAt: null,
    budgetSec: duration,
    remainingSec: duration,
    status: "idle",
  };
}

export function secondsLeft(timer: SessionTimer, now: number): number {
  if (timer.status === "running" && timer.startedAt != null) {
    const elapsedSec = (now - timer.startedAt) / 1000;
    const raw = timer.budgetSec - elapsedSec;
    return Math.max(0, Math.min(timer.budgetSec, Math.ceil(raw)));
  }
  return Math.max(0, Math.ceil(timer.remainingSec));
}

export function startSession(timer: SessionTimer, now: number): SessionTimer {
  const remaining =
    timer.status === "running" ? secondsLeft(timer, now) : timer.remainingSec;
  if (remaining <= 0) {
    return {
      ...timer,
      status: "complete",
      startedAt: timer.startedAt,
      budgetSec: 0,
      remainingSec: 0,
    };
  }
  return {
    ...timer,
    status: "running",
    startedAt: now,
    budgetSec: remaining,
    remainingSec: remaining,
  };
}

export function pauseSession(timer: SessionTimer, now: number): SessionTimer {
  if (timer.status !== "running") return timer;
  const left = secondsLeft(timer, now);
  if (left <= 0) {
    return { ...timer, status: "complete", remainingSec: 0, budgetSec: 0 };
  }
  return {
    ...timer,
    status: "paused",
    startedAt: null,
    budgetSec: left,
    remainingSec: left,
  };
}

/** Same reference when nothing changed, so callers can skip a write. */
export function settleSession(timer: SessionTimer, now: number): SessionTimer {
  if (timer.status !== "running") return timer;
  if (secondsLeft(timer, now) > 0) return timer;
  return { ...timer, status: "complete", remainingSec: 0, budgetSec: 0 };
}

export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function serializeSession(timer: SessionTimer): string {
  return JSON.stringify(timer);
}

export function parseSession(raw: string | null | undefined): SessionTimer | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<SessionTimer> | null;
    if (!value || typeof value !== "object") return null;
    if (typeof value.scriptId !== "string" || !value.scriptId) return null;
    if (typeof value.durationSec !== "number" || value.durationSec < 0) return null;
    if (
      value.status !== "idle" &&
      value.status !== "running" &&
      value.status !== "paused" &&
      value.status !== "complete"
    ) {
      return null;
    }
    return {
      scriptId: value.scriptId,
      durationSec: value.durationSec,
      startedAt: typeof value.startedAt === "number" ? value.startedAt : null,
      budgetSec:
        typeof value.budgetSec === "number" ? value.budgetSec : value.durationSec,
      remainingSec:
        typeof value.remainingSec === "number"
          ? value.remainingSec
          : value.durationSec,
      status: value.status,
    };
  } catch {
    return null;
  }
}
