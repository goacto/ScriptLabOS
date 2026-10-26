import { describe, it, expect } from "vitest";
import { makeGss } from "./gss";
import {
  OVERWRITE_CONFIRM,
  emptyState,
  exportState,
  importState,
  migrateState,
  resolveImport,
} from "./storage";
import type { Profile, ScriptLabState } from "./types";

const profile: Profile = {
  name: "Audit Tester",
  wakeUps: [{ id: "w1", text: "I wake up to train." }],
  values: ["Growth"],
  goals: ["Ship"],
  createdAt: "2026-10-26T18:54:00.000Z",
};

function saved(): ScriptLabState {
  const script = makeGss({
    title: "Morning Breathwork",
    type: "baseline",
    durationMin: 10,
    runs: [
      {
        at: "2026-10-26T23:40:10.601Z",
        completed: true,
        durationMin: 10,
      },
    ],
  });
  return {
    ...emptyState,
    profile,
    scripts: [script],
    xp: 10,
    streak: 1,
    lastPassedDate: "2026-10-26",
  };
}

describe("import validation", () => {
  it("rejects invalid JSON with the parser's error", () => {
    const confirm = () => {
      throw new Error("confirm should not run");
    };
    const decision = resolveImport("{", saved(), confirm);
    expect(decision.ok).toBe(false);
    if (decision.ok || decision.cancelled) throw new Error("expected a parse error");
    expect(decision.error).toMatch(/isn't valid JSON/i);
    expect(decision.error).toMatch(/JSON/i);
  });

  it("rejects the wrong shape without touching current data", () => {
    const current = saved();
    let asked = false;
    const decision = resolveImport(
      JSON.stringify({ hello: "world" }),
      current,
      () => {
        asked = true;
        return true;
      }
    );
    expect(asked).toBe(false);
    expect(decision.ok).toBe(false);
    if (decision.ok || decision.cancelled) throw new Error("expected a shape error");
    expect(decision.error).toMatch(/isn't a ScriptLabOS backup/i);
    expect(decision.error).toMatch(/hello/);
  });

  it("asks before an import overwrites existing data", () => {
    const current = saved();
    const incoming = {
      ...emptyState,
      profile: { ...profile, name: "Imported" },
      xp: 50,
    };
    const declined = resolveImport(JSON.stringify(incoming), current, () => false);
    expect(declined).toEqual({ ok: false, cancelled: true });

    let message = "";
    const accepted = resolveImport(JSON.stringify(incoming), current, (prompt) => {
      message = prompt;
      return true;
    });
    expect(message).toBe(OVERWRITE_CONFIRM);
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) throw new Error("expected a successful import");
    expect(accepted.state.profile?.name).toBe("Imported");
    expect(accepted.state.xp).toBe(50);
    expect(accepted.state.scripts).toEqual([]);
  });

  it("does not ask when there is nothing to overwrite", () => {
    let asked = false;
    const decision = resolveImport(
      exportState(saved()),
      emptyState,
      () => {
        asked = true;
        return false;
      }
    );
    expect(asked).toBe(false);
    expect(decision.ok).toBe(true);
  });

  it("round-trips a current backup, including runs saved before this fix", () => {
    const current = saved();
    const decision = resolveImport(exportState(current), emptyState, () => false);
    expect(decision.ok).toBe(true);
    if (!decision.ok) throw new Error("expected a round-trip");
    expect(decision.state.profile).toEqual(current.profile);
    expect(decision.state.scripts).toEqual(current.scripts);
    expect(decision.state.xp).toBe(10);
    expect(decision.state.streak).toBe(1);
    expect(decision.state.lastPassedDate).toBe("2026-10-26");
  });

  it("keeps fields it does not know about", () => {
    const current = saved();
    const script = {
      ...current.scripts[0],
      runs: [{ ...current.scripts[0].runs[0], note: "Calmer start." }],
    };
    const payload = { ...current, scripts: [script], customFlag: true };
    const decision = resolveImport(JSON.stringify(payload), emptyState, () => false);
    expect(decision.ok).toBe(true);
    if (!decision.ok) throw new Error("expected extra fields to survive");
    const restored = decision.state as ScriptLabState & { customFlag?: boolean };
    const restoredRun = restored.scripts[0].runs[0] as { note?: string };
    expect(restored.customFlag).toBe(true);
    expect(restoredRun.note).toBe("Calmer start.");
    expect(restored.scripts[0].runs[0].at).toBe("2026-10-26T23:40:10.601Z");
  });

  it("accepts a partial backup that omits newer optional fields", () => {
    const decision = resolveImport(
      JSON.stringify({ profile, scripts: [], xp: 3 }),
      emptyState,
      () => true
    );
    expect(decision.ok).toBe(true);
    if (!decision.ok) throw new Error("expected a partial import");
    expect(decision.state.xp).toBe(3);
    expect(decision.state.packages).toEqual([]);
    expect(decision.state.achievements).toEqual([]);
    expect(decision.state.profile?.wakeUps).toEqual(profile.wakeUps);
  });
});

describe("migrateState", () => {
  const legacy = {
    scripts: [
      { ...makeGss({ title: "doomscroll", type: "bug" }), runs: [{ at: "2026-10-01T00:00:00Z", completed: true, durationMin: 0 }] },
      { ...makeGss({ title: "breath", type: "baseline" }), runs: [{ at: "2026-10-01T00:00:00Z", completed: true, durationMin: 10 }] },
    ],
  };

  it("turns legacy Quick Log runs into relapses and other runs into sessions", () => {
    const migrated = migrateState(legacy);
    expect(migrated.scripts[0].runs[0]).toMatchObject({ kind: "relapse", completed: false });
    expect(migrated.scripts[1].runs[0]).toMatchObject({ kind: "session", completed: true });
    expect(migrated.xp).toBe(0); // defaults filled from emptyState
  });

  it("is idempotent and keeps saved reviews", () => {
    const review = { whatWorked: "a", whatDidnt: "b", insights: "c" };
    const withReview = migrateState({
      scripts: [{ ...legacy.scripts[1], runs: [{ ...legacy.scripts[1].runs[0], kind: "session", review }] }],
    });
    expect(migrateState(withReview)).toEqual(withReview);
    expect(withReview.scripts[0].runs[0].review).toEqual(review);
  });

  it("applies on import of an exported legacy backup", () => {
    expect(importState(JSON.stringify(legacy)).scripts[0].runs[0].kind).toBe("relapse");
  });
});
