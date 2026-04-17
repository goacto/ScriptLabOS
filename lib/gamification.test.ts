import { describe, it, expect } from "vitest";
import {
  LEVELS,
  bumpStreak,
  levelFor,
  maybeUnlockAchievements,
  todayStr,
  xpForRun,
} from "./gamification";
import { makeGss } from "./gss";
import { emptyState } from "./storage";
import type { GssFile, ScriptLabState } from "./types";

const baseScript = (overrides: Partial<GssFile> = {}): GssFile =>
  makeGss({ title: "x", type: "baseline", ...overrides });

describe("xpForRun", () => {
  it("multiplies duration by typeMultiplier", () => {
    expect(xpForRun(baseScript({ type: "baseline" }), 25)).toBe(25);
    expect(xpForRun(baseScript({ type: "update" }), 25)).toBe(38);
    expect(xpForRun(baseScript({ type: "upgrade" }), 25)).toBe(50);
    expect(xpForRun(baseScript({ type: "bug" }), 25)).toBe(75);
    expect(xpForRun(baseScript({ type: "virus" }), 25)).toBe(75);
  });
});

describe("levelFor", () => {
  it("returns Junior Dev at 0 XP", () => {
    const { current, next, progress } = levelFor(0);
    expect(current.name).toBe("Junior Dev");
    expect(next.name).toBe("Dev");
    expect(progress).toBe(0);
  });
  it("returns the top level at the cap and clamps progress to 1", () => {
    const top = LEVELS[LEVELS.length - 1];
    const { current, progress } = levelFor(top.threshold + 10000);
    expect(current.name).toBe("Architect of Self");
    expect(progress).toBe(1);
  });
  it("computes interpolated progress between thresholds", () => {
    const { current, next, progress } = levelFor(75);
    expect(current.name).toBe("Junior Dev");
    expect(next.name).toBe("Dev");
    expect(progress).toBeCloseTo(0.5, 1);
  });
});

describe("maybeUnlockAchievements", () => {
  it("emits first-run on a baseline run", () => {
    const unlocks = maybeUnlockAchievements(emptyState, {
      kind: "run-completed",
      script: baseScript({ type: "baseline" }),
    });
    expect(unlocks.map((u) => u.id)).toContain("first-run");
  });
  it("emits first-bug-patched on a bug run", () => {
    const unlocks = maybeUnlockAchievements(emptyState, {
      kind: "run-completed",
      script: baseScript({ type: "bug" }),
    });
    expect(unlocks.map((u) => u.id).sort()).toEqual([
      "first-bug-patched",
      "first-run",
    ]);
  });
  it("does not re-emit existing achievements", () => {
    const seeded: ScriptLabState = {
      ...emptyState,
      achievements: [
        {
          id: "first-run",
          title: "Hello World",
          description: "",
          unlockedAt: "x",
        },
      ],
    };
    const unlocks = maybeUnlockAchievements(seeded, {
      kind: "run-completed",
      script: baseScript({ type: "baseline" }),
    });
    expect(unlocks.find((u) => u.id === "first-run")).toBeUndefined();
  });
});

describe("bumpStreak", () => {
  it("starts the streak at 1 on first pass", () => {
    const next = bumpStreak(emptyState);
    expect(next.streak).toBe(1);
    expect(next.lastPassedDate).toBe(todayStr());
  });
  it("is idempotent within the same day", () => {
    const once = bumpStreak(emptyState);
    const twice = bumpStreak(once);
    expect(twice.streak).toBe(1);
  });
  it("increments when yesterday was passed", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const seeded: ScriptLabState = {
      ...emptyState,
      streak: 3,
      lastPassedDate: yesterday,
    };
    const next = bumpStreak(seeded);
    expect(next.streak).toBe(4);
  });
  it("resets when there is a gap", () => {
    const gap = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10);
    const seeded: ScriptLabState = {
      ...emptyState,
      streak: 12,
      lastPassedDate: gap,
    };
    const next = bumpStreak(seeded);
    expect(next.streak).toBe(1);
  });
});
