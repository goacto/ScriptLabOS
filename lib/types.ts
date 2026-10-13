export type GssType =
  | "baseline"
  | "update"
  | "upgrade"
  | "bug"
  | "virus"
  | "package";

export interface SessionReview {
  whatWorked: string;
  whatDidnt: string;
  insights: string;
}

/**
 * "session" = a timed run of a script (Tester / Pomodoro).
 * "relapse" = a Quick Log of a bug/virus firing. Relapses never earn XP or
 * patch credit. Runs saved before this field existed are normalized on load.
 */
export type GssRunKind = "session" | "relapse";

export interface GssRun {
  at: string;
  completed: boolean;
  durationMin: number;
  kind?: GssRunKind;
  review?: SessionReview;
}

export interface GssFile {
  id: string;
  name: string;
  title: string;
  type: GssType;
  durationMin: number;
  intent: string;
  steps: string[];
  tags: string[];
  linkedValue?: string;
  createdAt: string;
  updatedAt: string;
  runs: GssRun[];
}

export interface Package {
  id: string;
  name: string;
  title: string;
  scriptIds: string[];
  createdAt: string;
}

export interface ExecutableSlot {
  time: string;
  scriptId?: string;
  packageId?: string;
}

export interface DailyReflection {
  wins: string;
  challenges: string;
  tomorrowFocus: string;
}

export interface Executable {
  id: string;
  date: string;
  slots: ExecutableSlot[];
  status: "draft" | "in-progress" | "complete";
  completedScriptIds?: string[]; // Scripts actually completed during the day
  reflection?: DailyReflection; // End-of-day reflection
  completedAt?: string; // When the day was shipped
}

export interface WakeUpStatement {
  id: string;
  text: string;
}

export interface Profile {
  name: string;
  wakeUps: WakeUpStatement[];
  values: string[];
  goals: string[];
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
}

export interface ScriptLabState {
  profile: Profile | null;
  scripts: GssFile[];
  packages: Package[];
  executables: Executable[];
  xp: number;
  streak: number;
  lastPassedDate?: string;
  achievements: Achievement[];
}
