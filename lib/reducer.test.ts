import { describe, it, expect } from "vitest";
import { reducer } from "./reducer";
import { emptyState } from "./storage";
import { makeGss } from "./gss";
import type { GssFile, Package, Profile, ScriptLabState } from "./types";

const baseline = (overrides: Partial<GssFile> = {}): GssFile =>
  makeGss({ title: "breath", type: "baseline", durationMin: 10, ...overrides });

const profile: Profile = {
  name: "neo",
  wakeUps: [],
  values: [],
  goals: [],
  createdAt: "x",
};

describe("reducer: scripts", () => {
  it("adds a script", () => {
    const s = baseline();
    const next = reducer(emptyState, { type: "addScript", script: s });
    expect(next.scripts).toEqual([s]);
  });

  it("updates a script by id", () => {
    const s = baseline({ title: "old" });
    const afterAdd = reducer(emptyState, { type: "addScript", script: s });
    const renamed = { ...s, title: "new" };
    const next = reducer(afterAdd, { type: "updateScript", script: renamed });
    expect(next.scripts[0].title).toBe("new");
  });

  it("deletes a script and strips its id from every package", () => {
    const s1 = baseline({ title: "keep" });
    const s2 = baseline({ title: "drop" });
    const pkg: Package = {
      id: "p1",
      name: "morning",
      title: "Morning",
      scriptIds: [s1.id, s2.id],
      createdAt: "x",
    };
    let state: ScriptLabState = emptyState;
    state = reducer(state, { type: "addScript", script: s1 });
    state = reducer(state, { type: "addScript", script: s2 });
    state = reducer(state, { type: "addPackage", pkg });
    state = reducer(state, { type: "deleteScript", id: s2.id });
    expect(state.scripts.map((s) => s.id)).toEqual([s1.id]);
    expect(state.packages[0].scriptIds).toEqual([s1.id]);
  });
});

describe("reducer: recordRun", () => {
  it("is a no-op when the script id doesn't exist", () => {
    const next = reducer(emptyState, {
      type: "recordRun",
      scriptId: "nope",
      completed: true,
      durationMin: 25,
    });
    expect(next).toBe(emptyState);
  });

  it("appends a run and awards XP on completion", () => {
    const s = baseline({ durationMin: 25 });
    const seeded = reducer(emptyState, { type: "addScript", script: s });
    const next = reducer(seeded, {
      type: "recordRun",
      scriptId: s.id,
      completed: true,
      durationMin: 25,
    });
    expect(next.scripts[0].runs).toHaveLength(1);
    expect(next.scripts[0].runs[0].completed).toBe(true);
    expect(next.xp).toBe(25);
    expect(next.achievements.find((a) => a.id === "first-run")).toBeTruthy();
  });

  it("logs a partial run without XP on bail", () => {
    const s = baseline({ durationMin: 25 });
    const seeded = reducer(emptyState, { type: "addScript", script: s });
    const next = reducer(seeded, {
      type: "recordRun",
      scriptId: s.id,
      completed: false,
      durationMin: 7,
    });
    expect(next.scripts[0].runs[0].completed).toBe(false);
    expect(next.xp).toBe(0);
    expect(next.achievements).toHaveLength(0);
  });
});

describe("reducer: passDay", () => {
  it("marks today's executable passed, bumps streak, and unlocks first-compile once", () => {
    const seeded: ScriptLabState = { ...emptyState, profile };
    const once = reducer(seeded, { type: "passDay" });
    expect(once.streak).toBe(1);
    expect(once.executables.some((e) => e.status === "passed")).toBe(true);
    expect(once.achievements.find((a) => a.id === "first-compile")).toBeTruthy();

    const twice = reducer(once, { type: "passDay" });
    expect(twice.streak).toBe(1); // same day, no double-increment
    const firstCompileCount = twice.achievements.filter(
      (a) => a.id === "first-compile"
    ).length;
    expect(firstCompileCount).toBe(1);
  });
});

describe("reducer: reset + importAll", () => {
  it("reset returns emptyState", () => {
    const seeded = reducer(emptyState, {
      type: "addScript",
      script: baseline(),
    });
    const next = reducer(seeded, { type: "reset" });
    expect(next).toEqual(emptyState);
  });

  it("importAll wholesale replaces state", () => {
    const imported: ScriptLabState = {
      ...emptyState,
      profile,
      xp: 999,
    };
    const next = reducer(emptyState, { type: "importAll", state: imported });
    expect(next.xp).toBe(999);
    expect(next.profile?.name).toBe("neo");
  });
});
