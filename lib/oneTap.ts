import type { GssFile } from "./types";

/** Home Screen shortcut target. `start=1` is removed after it is used. */
export const ONE_TAP_RUN_URL = "/tester?start=1";

type MinimalSession = { scriptId: string; status: string } | null | undefined;

/** Script to run when no ?id= is given: first 25-min runnable script, else first runnable. */
export function pickOneTapScript<T extends Pick<GssFile, "id" | "type" | "durationMin">>(
  scripts: T[]
): T | null {
  const runnable = scripts.filter((s) => s.type !== "bug" && s.type !== "virus");
  return runnable.find((s) => s.durationMin === 25) ?? runnable[0] ?? null;
}

/**
 * Start only when the shortcut asked for it and nothing is already running or
 * paused, so a reload or a second tap never restarts or doubles a session.
 */
export function shouldAutoStart(start: string | null, session: MinimalSession): boolean {
  if (start !== "1") return false;
  if (session && (session.status === "running" || session.status === "paused")) return false;
  return true;
}
