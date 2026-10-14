import type { GssFile, GssRun } from "./types";

export const CLEAN_STREAK_DAYS_TO_ELIMINATE = 21;
const DAY_MS = 24 * 60 * 60 * 1000;

export const isRelapse = (run: GssRun) => run.kind === "relapse";

export interface CleanStreak {
  relapseCount: number;
  lastRelapseAt: string | null;
  /** Full days since the last logged relapse; null until one is logged. */
  daysClean: number | null;
  isEliminated: boolean;
}

/**
 * A clean streak is only real once it is anchored to a logged check-in:
 * it counts full days since the most recent logged relapse. A bad habit that
 * has never been logged has no streak yet, so it can't reach "Eliminated"
 * just by sitting in the Library (it used to count days from createdAt).
 */
export function cleanStreakFor(script: GssFile, now: Date): CleanStreak {
  const relapses = script.runs.filter(isRelapse);
  const lastRelapseAt = relapses.length
    ? relapses.reduce((latest, r) => (r.at > latest ? r.at : latest), relapses[0].at)
    : null;
  const daysClean =
    lastRelapseAt === null
      ? null
      : Math.max(0, Math.floor((now.getTime() - new Date(lastRelapseAt).getTime()) / DAY_MS));
  return {
    relapseCount: relapses.length,
    lastRelapseAt,
    daysClean,
    isEliminated: daysClean !== null && daysClean >= CLEAN_STREAK_DAYS_TO_ELIMINATE,
  };
}
