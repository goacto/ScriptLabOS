import type {
  Achievement,
  Executable,
  ExecutableSlot,
  GssFile,
  GssRun,
  Package,
  Profile,
  ScriptLabState,
} from "./types";

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

const KNOWN_KEYS = [
  "profile",
  "scripts",
  "packages",
  "executables",
  "xp",
  "streak",
  "achievements",
  "lastPassedDate",
] as const;

export const OVERWRITE_CONFIRM =
  "Import will replace your current profile, scripts, and progress on this browser. Continue?";

export class ImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportValidationError";
  }
}

export type ValidatedImport =
  | { ok: true; state: ScriptLabState }
  | { ok: false; error: string };

export type ImportDecision =
  | { ok: true; state: ScriptLabState }
  | { ok: false; cancelled: true }
  | { ok: false; cancelled: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function normalizeRun(raw: unknown): GssRun | null {
  if (!isRecord(raw)) return null;
  return {
    ...raw,
    at: typeof raw.at === "string" ? raw.at : "",
    completed: raw.completed === true,
    durationMin: typeof raw.durationMin === "number" ? raw.durationMin : 0,
  } as GssRun;
}

function normalizeScript(raw: unknown): GssFile | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== "string" || typeof raw.type !== "string") return null;
  const runsRaw = raw.runs;
  if (runsRaw !== undefined && !Array.isArray(runsRaw)) return null;
  const runs = Array.isArray(runsRaw)
    ? runsRaw.map(normalizeRun)
    : [];
  if (runs.some((run) => run === null)) return null;
  return {
    ...raw,
    id: raw.id,
    name: typeof raw.name === "string" ? raw.name : "",
    title:
      typeof raw.title === "string"
        ? raw.title
        : typeof raw.name === "string"
          ? raw.name
          : "untitled",
    type: raw.type as GssFile["type"],
    durationMin: typeof raw.durationMin === "number" ? raw.durationMin : 0,
    intent: typeof raw.intent === "string" ? raw.intent : "",
    steps: Array.isArray(raw.steps)
      ? raw.steps.filter((step): step is string => typeof step === "string")
      : [],
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    linkedValue: typeof raw.linkedValue === "string" ? raw.linkedValue : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : "",
    runs: runs as GssRun[],
  } as GssFile;
}

function normalizeProfile(raw: unknown): Profile | null {
  if (raw === null) return null;
  if (!isRecord(raw) || typeof raw.name !== "string") return null;
  const wakeUps = Array.isArray(raw.wakeUps) ? raw.wakeUps : [];
  return {
    ...raw,
    name: raw.name,
    wakeUps: wakeUps.filter(isRecord).map((wake) => ({
      ...wake,
      id: typeof wake.id === "string" ? wake.id : "",
      text: typeof wake.text === "string" ? wake.text : "",
    })),
    values: Array.isArray(raw.values)
      ? raw.values.filter((value): value is string => typeof value === "string")
      : [],
    goals: Array.isArray(raw.goals)
      ? raw.goals.filter((goal): goal is string => typeof goal === "string")
      : [],
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
  } as Profile;
}

function normalizePackage(raw: unknown): Package | null {
  if (!isRecord(raw) || typeof raw.id !== "string") return null;
  if (raw.scriptIds !== undefined && !Array.isArray(raw.scriptIds)) return null;
  return {
    ...raw,
    id: raw.id,
    name: typeof raw.name === "string" ? raw.name : "",
    title: typeof raw.title === "string" ? raw.title : "",
    scriptIds: Array.isArray(raw.scriptIds)
      ? raw.scriptIds.filter((id): id is string => typeof id === "string")
      : [],
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
  } as Package;
}

function normalizeSlot(raw: unknown): ExecutableSlot | null {
  if (!isRecord(raw) || typeof raw.time !== "string") return null;
  return {
    ...raw,
    time: raw.time,
    scriptId: typeof raw.scriptId === "string" ? raw.scriptId : undefined,
    packageId: typeof raw.packageId === "string" ? raw.packageId : undefined,
  } as ExecutableSlot;
}

function normalizeExecutable(raw: unknown): Executable | null {
  if (!isRecord(raw) || typeof raw.id !== "string" || typeof raw.date !== "string") {
    return null;
  }
  const status = raw.status;
  if (
    status !== undefined &&
    status !== "draft" &&
    status !== "in-progress" &&
    status !== "complete"
  ) {
    return null;
  }
  if (raw.slots !== undefined && !Array.isArray(raw.slots)) return null;
  const slots = Array.isArray(raw.slots) ? raw.slots.map(normalizeSlot) : [];
  if (slots.some((slot) => slot === null)) return null;
  const exe: Executable = {
    ...(raw as unknown as Executable),
    id: raw.id,
    date: raw.date,
    slots: slots as ExecutableSlot[],
    status: (status as Executable["status"]) ?? "draft",
  };
  if (Array.isArray(raw.completedScriptIds)) {
    exe.completedScriptIds = raw.completedScriptIds.filter(
      (id): id is string => typeof id === "string"
    );
  }
  if (isRecord(raw.reflection)) {
    exe.reflection = {
      ...raw.reflection,
      wins: typeof raw.reflection.wins === "string" ? raw.reflection.wins : "",
      challenges:
        typeof raw.reflection.challenges === "string"
          ? raw.reflection.challenges
          : "",
      tomorrowFocus:
        typeof raw.reflection.tomorrowFocus === "string"
          ? raw.reflection.tomorrowFocus
          : "",
    };
  }
  if (typeof raw.completedAt === "string") exe.completedAt = raw.completedAt;
  return exe;
}

function normalizeAchievement(raw: unknown): Achievement | null {
  if (!isRecord(raw) || typeof raw.id !== "string" || typeof raw.title !== "string") {
    return null;
  }
  return {
    ...raw,
    id: raw.id,
    title: raw.title,
    description: typeof raw.description === "string" ? raw.description : "",
    unlockedAt: typeof raw.unlockedAt === "string" ? raw.unlockedAt : "",
  } as Achievement;
}

function listOrThrow<T>(
  value: unknown,
  label: string,
  map: (item: unknown) => T | null
): T[] {
  if (!Array.isArray(value)) {
    throw new ImportValidationError(
      `Invalid backup: "${label}" must be a list.`
    );
  }
  return value.map((item, index) => {
    const next = map(item);
    if (!next) {
      throw new ImportValidationError(
        `Invalid backup: ${label} item ${index + 1} has the wrong shape.`
      );
    }
    return next;
  });
}

export function validateImportedState(value: unknown): ValidatedImport {
  try {
    if (!isRecord(value)) {
      return {
        ok: false,
        error:
          "This file isn't a ScriptLabOS backup. Expected a JSON object with your profile, scripts, or progress.",
      };
    }
    const present = KNOWN_KEYS.filter((key) => key in value);
    if (present.length === 0) {
      const found = Object.keys(value);
      const shown = found.length ? found.slice(0, 6).join(", ") : "none";
      return {
        ok: false,
        error: `This file isn't a ScriptLabOS backup. Expected profile, scripts, or progress. Found keys: ${shown}.`,
      };
    }

    const state: ScriptLabState = {
      ...emptyState,
      ...(value as Partial<ScriptLabState>),
    };
    if ("profile" in value) {
      if (value.profile !== null && !isRecord(value.profile)) {
        throw new ImportValidationError(
          'Invalid backup: "profile" must be an object or null.'
        );
      }
      const profile = normalizeProfile(value.profile);
      if (value.profile !== null && !profile) {
        throw new ImportValidationError(
          'Invalid backup: "profile" needs a name.'
        );
      }
      state.profile = profile;
    }
    if ("scripts" in value) {
      state.scripts = listOrThrow(value.scripts, "scripts", normalizeScript);
    }
    if ("packages" in value) {
      state.packages = listOrThrow(value.packages, "packages", normalizePackage);
    }
    if ("executables" in value) {
      state.executables = listOrThrow(
        value.executables,
        "executables",
        normalizeExecutable
      );
    }
    if ("achievements" in value) {
      state.achievements = listOrThrow(
        value.achievements,
        "achievements",
        normalizeAchievement
      );
    }
    if ("xp" in value) {
      if (typeof value.xp !== "number" || Number.isNaN(value.xp)) {
        throw new ImportValidationError('Invalid backup: "xp" must be a number.');
      }
      state.xp = value.xp;
    }
    if ("streak" in value) {
      if (typeof value.streak !== "number" || Number.isNaN(value.streak)) {
        throw new ImportValidationError(
          'Invalid backup: "streak" must be a number.'
        );
      }
      state.streak = value.streak;
    }
    if ("lastPassedDate" in value && value.lastPassedDate != null) {
      if (typeof value.lastPassedDate !== "string") {
        throw new ImportValidationError(
          'Invalid backup: "lastPassedDate" must be a date string.'
        );
      }
      state.lastPassedDate = value.lastPassedDate;
    }
    return { ok: true, state };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not read that backup.";
    return { ok: false, error: message };
  }
}

export function hasSavedProgress(state: ScriptLabState): boolean {
  return Boolean(
    state.profile ||
      state.scripts.length ||
      state.packages.length ||
      state.executables.length ||
      state.xp ||
      state.streak ||
      state.lastPassedDate ||
      state.achievements.length
  );
}

export function resolveImport(
  json: string,
  current: ScriptLabState,
  confirmOverwrite: (message: string) => boolean
): ImportDecision {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "parse error";
    return {
      ok: false,
      cancelled: false,
      error: `This file isn't valid JSON (${detail}). Choose a ScriptLabOS export.`,
    };
  }
  const validated = validateImportedState(parsed);
  if (!validated.ok) return { ok: false, cancelled: false, error: validated.error };
  if (hasSavedProgress(current)) {
    const accepted = confirmOverwrite(OVERWRITE_CONFIRM);
    if (!accepted) return { ok: false, cancelled: true };
  }
  return { ok: true, state: validated.state };
}

/** Keep older saves readable and make sure list fields cannot crash the UI. */
export function coerceLoadedState(value: unknown): ScriptLabState {
  const validated = validateImportedState(value);
  if (validated.ok) return validated.state;
  if (!isRecord(value)) return emptyState;
  const merged: ScriptLabState = {
    ...emptyState,
    ...(value as Partial<ScriptLabState>),
  };
  if (!Array.isArray(merged.scripts)) merged.scripts = [];
  if (!Array.isArray(merged.packages)) merged.packages = [];
  if (!Array.isArray(merged.executables)) merged.executables = [];
  if (!Array.isArray(merged.achievements)) merged.achievements = [];
  if (typeof merged.xp !== "number") merged.xp = 0;
  if (typeof merged.streak !== "number") merged.streak = 0;
  merged.scripts = merged.scripts
    .map((script) => normalizeScript(script))
    .filter((script): script is GssFile => script !== null);
  if (merged.profile && typeof merged.profile === "object") {
    merged.profile = normalizeProfile(merged.profile) ?? merged.profile;
  }
  return merged;
}

export function loadState(): ScriptLabState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyState;
    return migrateState(coerceLoadedState(JSON.parse(raw)));
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
  const decision = resolveImport(json, emptyState, () => true);
  if (!decision.ok) {
    throw new ImportValidationError(
      decision.cancelled ? "Import cancelled." : decision.error
    );
  }
  return migrateState(decision.state);
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
function tagLegacyRun(script: GssFile, run: GssRun): GssRun {
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
      runs: (script.runs ?? []).map((run) => tagLegacyRun(script, run)),
    })),
  };
}
