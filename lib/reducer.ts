import type {
  Executable,
  GssFile,
  Package,
  Profile,
  ScriptLabState,
  SessionReview,
} from "./types";
import {
  coerceLoadedState,
  emptyState,
  migrateState,
  validateImportedState,
} from "./storage";
import {
  bumpStreak,
  maybeUnlockAchievements,
  xpForRun,
} from "./gamification";
import { uid } from "./gss";

export type Action =
  | { type: "hydrate"; state: ScriptLabState }
  | { type: "setProfile"; profile: Profile }
  | { type: "addScript"; script: GssFile }
  | { type: "updateScript"; script: GssFile }
  | { type: "deleteScript"; id: string }
  | { type: "addPackage"; pkg: Package }
  | { type: "updatePackage"; pkg: Package }
  | { type: "deletePackage"; id: string }
  | { type: "upsertExecutable"; exe: Executable }
  | {
      type: "recordRun";
      scriptId: string;
      completed: boolean;
      durationMin: number;
      review?: SessionReview;
    }
  | { type: "logRelapse"; scriptId: string }
  | { type: "passDay" }
  | { type: "reset" }
  | { type: "importAll"; state: ScriptLabState }
  | {
      type: "startSampleDay";
      profile: Profile;
      scripts: GssFile[];
      executable: Executable;
    };

export function reducer(state: ScriptLabState, action: Action): ScriptLabState {
  switch (action.type) {
    case "hydrate":
      return migrateState(coerceLoadedState(action.state));
    case "importAll": {
      const checked = validateImportedState(action.state);
      if (!checked.ok) return state;
      return migrateState(checked.state);
    }
    case "setProfile":
      return { ...state, profile: action.profile };
    case "startSampleDay": {
      if (state.profile) return state;
      const owned = new Set(state.scripts.map((script) => script.title));
      const scripts = [
        ...state.scripts,
        ...action.scripts.filter((script) => !owned.has(script.title)),
      ];
      const hasDay = state.executables.some(
        (exe) => exe.date === action.executable.date
      );
      return {
        ...state,
        profile: action.profile,
        scripts,
        executables: hasDay
          ? state.executables
          : [...state.executables, action.executable],
      };
    }
    case "addScript":
      return { ...state, scripts: [...state.scripts, action.script] };
    case "updateScript":
      return {
        ...state,
        scripts: state.scripts.map((s) =>
          s.id === action.script.id ? action.script : s
        ),
      };
    case "deleteScript":
      return {
        ...state,
        scripts: state.scripts.filter((s) => s.id !== action.id),
        packages: state.packages.map((p) => ({
          ...p,
          scriptIds: p.scriptIds.filter((id) => id !== action.id),
        })),
      };
    case "addPackage":
      return { ...state, packages: [...state.packages, action.pkg] };
    case "updatePackage":
      return {
        ...state,
        packages: state.packages.map((p) =>
          p.id === action.pkg.id ? action.pkg : p
        ),
      };
    case "deletePackage":
      return {
        ...state,
        packages: state.packages.filter((p) => p.id !== action.id),
      };
    case "upsertExecutable": {
      const exists = state.executables.some((e) => e.id === action.exe.id);
      return {
        ...state,
        executables: exists
          ? state.executables.map((e) =>
              e.id === action.exe.id ? action.exe : e
            )
          : [...state.executables, action.exe],
      };
    }
    case "recordRun": {
      const script = state.scripts.find((s) => s.id === action.scriptId);
      if (!script) return state;
      const updated: GssFile = {
        ...script,
        runs: [
          ...script.runs,
          {
            at: new Date().toISOString(),
            completed: action.completed,
            durationMin: action.durationMin,
            kind: "session",
            ...(action.review ? { review: action.review } : {}),
          },
        ],
        updatedAt: new Date().toISOString(),
      };
      const nextScripts = state.scripts.map((s) =>
        s.id === script.id ? updated : s
      );
      let nextState: ScriptLabState = { ...state, scripts: nextScripts };
      if (action.completed) {
        const gained = xpForRun(script, action.durationMin);
        nextState = { ...nextState, xp: state.xp + gained };
        const unlocks = maybeUnlockAchievements(nextState, {
          kind: "run-completed",
          script,
        });
        if (unlocks.length) {
          nextState = {
            ...nextState,
            achievements: [...nextState.achievements, ...unlocks],
          };
        }
      }
      return nextState;
    }
    case "logRelapse": {
      const loggedAt = new Date().toISOString();
      return {
        ...state,
        scripts: state.scripts.map((s) =>
          s.id === action.scriptId
            ? {
                ...s,
                runs: [
                  ...s.runs,
                  { at: loggedAt, completed: false, durationMin: 0, kind: "relapse" },
                ],
                updatedAt: loggedAt,
              }
            : s
        ),
      };
    }
    case "passDay": {
      const bumped = bumpStreak(state);
      let next: ScriptLabState = { ...bumped };
      const unlocks = maybeUnlockAchievements(next, { kind: "day-passed" });
      if (unlocks.length) {
        next = { ...next, achievements: [...next.achievements, ...unlocks] };
      }
      return next;
    }
    case "reset":
      return emptyState;
    default:
      return state;
  }
}
