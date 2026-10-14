import type { GssFile, GssRun, ScriptLabState } from "./types";

const KEY = "scriptlab:v1";

export const emptyState: ScriptLabState = {
  profile: null,
  scripts: [],
  packages: [],
  executables: [],
  xp: 0,
  streak: 0,
  achievements: [],
};

export function loadState(): ScriptLabState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyState;
    return migrateState(JSON.parse(raw));
  } catch {
    return emptyState;
  }
}

export function saveState(state: ScriptLabState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function exportState(state: ScriptLabState): string {
  return JSON.stringify(state, null, 2);
}

export function importState(json: string): ScriptLabState {
  return migrateState(JSON.parse(json));
}

export function resetState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

const isBadHabit = (script: GssFile) =>
  script.type === "bug" || script.type === "virus";

/**
 * Before run kinds existed, Quick Log stored a bug/virus firing as a
 * completed 0-minute run, which counted as "patched". The Tester never runs
 * bug/virus scripts, so those legacy runs are exactly the Quick Logs.
 */
function normalizeRun(script: GssFile, run: GssRun): GssRun {
  if (run.kind) return run;
  const isLegacyQuickLog = isBadHabit(script) && run.durationMin === 0;
  return isLegacyQuickLog
    ? { ...run, kind: "relapse", completed: false }
    : { ...run, kind: "session" };
}

/** Additive, idempotent migration for any stored or imported state. */
export function migrateState(raw: Partial<ScriptLabState>): ScriptLabState {
  const merged: ScriptLabState = { ...emptyState, ...raw };
  return {
    ...merged,
    scripts: (merged.scripts ?? []).map((script) => ({
      ...script,
      runs: (script.runs ?? []).map((run) => normalizeRun(script, run)),
    })),
  };
}
