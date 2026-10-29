import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { BOOK_MODULES, getModule, isAvailable, loadAnswers, saveAnswer, BOOK_KEY } from "./bookModules";

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

describe("book modules skeleton", () => {
  it("lists 13 chapters in order", () => {
    expect(BOOK_MODULES.map((m) => m.chapter)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13]);
  });
  it("every module is free", () => {
    expect(BOOK_MODULES.every((m) => m.free === true)).toBe(true);
  });
  it("exactly one SAMPLE module has content", () => {
    expect(BOOK_MODULES.filter(isAvailable).map((m) => m.id)).toEqual(["ch01-repo"]);
    expect(getModule("ch01-repo")?.sample).toBe(true);
    expect(getModule("ch01-repo")?.steps.map((s) => s.id)).toEqual(["flinch", "yes", "coldness"]);
  });
  it("answers save locally and survive reload", () => {
    const s = mem();
    saveAnswer(s, "ch01-repo", "flinch.recent", "at the meeting");
    expect(loadAnswers(s)["ch01-repo"]["flinch.recent"]).toBe("at the meeting");
    expect(s.getItem(BOOK_KEY)).toContain("flinch.recent");
  });
  it("bad storage does not crash", () => {
    expect(loadAnswers({ getItem: () => "{oops" })).toEqual({});
  });
  it("book pages have no paywall, pricing or streak copy", () => {
    const root = path.resolve(__dirname, "..");
    for (const f of ["app/book/page.tsx", "app/book/[id]/page.tsx", "lib/bookModules.ts"]) {
      const src = readFileSync(path.join(root, f), "utf8").replace(/There is no paywall, tier check or upgrade prompt here\./, "");
      expect(src).not.toMatch(/\$\d|upgrade|paywall|\bpro\b|streak|unlock/i);
      expect(src).not.toMatch(/ & /);
    }
  });
});
