import type { ScriptLabState } from "./types";

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
    return { ...emptyState, ...JSON.parse(raw) };
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
  const parsed = JSON.parse(json);
  return { ...emptyState, ...parsed };
}

export function resetState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
