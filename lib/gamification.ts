import type { Achievement, GssFile, ScriptLabState } from "./types";

const typeMultiplier = {
  baseline: 1,
  update: 1.5,
  upgrade: 2,
  bug: 3,
  virus: 3,
  package: 1,
} as const;

export function xpForRun(script: GssFile, durationMin: number): number {
  return Math.round(durationMin * (typeMultiplier[script.type] ?? 1));
}

export const LEVELS = [
  { name: "Junior Dev", threshold: 0 },
  { name: "Dev", threshold: 150 },
  { name: "Senior Dev", threshold: 500 },
  { name: "Staff", threshold: 1200 },
  { name: "Principal", threshold: 2500 },
  { name: "Architect of Self", threshold: 5000 },
];

export function levelFor(xp: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].threshold) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? LEVELS[i];
    }
  }
  const progress =
    next === current
      ? 1
      : (xp - current.threshold) / (next.threshold - current.threshold);
  return { current, next, progress: Math.min(1, Math.max(0, progress)) };
}

export function maybeUnlockAchievements(
  state: ScriptLabState,
  event:
    | { kind: "run-completed"; script: GssFile }
    | { kind: "day-passed" }
    | { kind: "level-up" }
): Achievement[] {
  const unlocked: Achievement[] = [];
  const has = (id: string) => state.achievements.some((a) => a.id === id);
  const now = new Date().toISOString();

  if (event.kind === "run-completed") {
    if (!has("first-run")) {
      unlocked.push({
        id: "first-run",
        title: "Hello World",
        description: "Completed your first .gss run.",
        unlockedAt: now,
      });
    }
    if (event.script.type === "bug" && !has("first-bug-patched")) {
      unlocked.push({
        id: "first-bug-patched",
        title: "Patch Notes",
        description: "Patched your first bug.",
        unlockedAt: now,
      });
    }
    if (event.script.type === "virus" && !has("first-virus-deleted")) {
      unlocked.push({
        id: "first-virus-deleted",
        title: "Quarantined",
        description: "Overwrote your first limiting belief.",
        unlockedAt: now,
      });
    }
  }

  if (event.kind === "day-passed") {
    if (!has("first-compile")) {
      unlocked.push({
        id: "first-compile",
        title: "First Compile",
        description: "Shipped your first daily executable.",
        unlockedAt: now,
      });
    }
    if (state.streak + 1 >= 7 && !has("streak-7")) {
      unlocked.push({
        id: "streak-7",
        title: "Seven-Day Build",
        description: "7-day streak of passing builds.",
        unlockedAt: now,
      });
    }
  }

  return unlocked;
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function bumpStreak(state: ScriptLabState): ScriptLabState {
  const today = todayStr();
  if (state.lastPassedDate === today) return state;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const nextStreak = state.lastPassedDate === yesterday ? state.streak + 1 : 1;
  return { ...state, streak: nextStreak, lastPassedDate: today };
}
