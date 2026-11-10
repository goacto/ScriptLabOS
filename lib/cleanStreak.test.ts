import { describe, it, expect } from "vitest";
import {
  cleanStreakFor,
  CLEAN_STREAK_DAYS_TO_ELIMINATE,
  relapseWhenLabel,
} from "./cleanStreak";
import { makeGss } from "./gss";
import type { GssRun } from "./types";

const DAY = 86400000;
const now = new Date("2026-10-13T12:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * DAY).toISOString();
const relapse = (at: string): GssRun => ({ at, completed: false, durationMin: 0, kind: "relapse" });
const bugCreated = (createdDaysAgo: number, runs: GssRun[] = []) => ({
  ...makeGss({ title: "doomscroll", type: "bug" }),
  createdAt: daysAgo(createdDaysAgo),
  runs,
});

describe("cleanStreakFor (c)", () => {
  it("never-logged bad habit is NOT eliminated, however old it is", () => {
    const streak = cleanStreakFor(bugCreated(60), now);
    expect(streak.isEliminated).toBe(false);
    expect(streak.daysClean).toBeNull();
  });

  it("counts full days since the most recent logged relapse", () => {
    const streak = cleanStreakFor(bugCreated(60, [relapse(daysAgo(30)), relapse(daysAgo(5))]), now);
    expect(streak.daysClean).toBe(5);
    expect(streak.relapseCount).toBe(2);
    expect(streak.isEliminated).toBe(false);
  });

  it("eliminates only at 21 full clean days after a logged relapse", () => {
    const at20 = cleanStreakFor(bugCreated(60, [relapse(daysAgo(20.9))]), now);
    const at21 = cleanStreakFor(bugCreated(60, [relapse(daysAgo(CLEAN_STREAK_DAYS_TO_ELIMINATE))]), now);
    expect(at20.isEliminated).toBe(false);
    expect(at21.isEliminated).toBe(true);
  });

  it("labels a relapse by the local calendar day, not a 24-hour bucket", () => {
    const morning = new Date("2026-10-13T14:00:00.000Z");
    const lastNight = "2026-10-13T01:30:00.000Z";
    expect(relapseWhenLabel(lastNight, morning)).toBe("yesterday");
    expect(relapseWhenLabel("2026-10-13T13:00:00.000Z", morning)).toBe("today");
    expect(relapseWhenLabel(daysAgo(3), now)).toBe("older");
  });

  it("ignores session runs when anchoring the streak", () => {
    const session: GssRun = { at: daysAgo(30), completed: true, durationMin: 10, kind: "session" };
    expect(cleanStreakFor(bugCreated(60, [session]), now).isEliminated).toBe(false);
  });
});
