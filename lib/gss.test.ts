import { describe, it, expect } from "vitest";
import { makeGss, slugify, uid } from "./gss";

describe("slugify", () => {
  it("lowercases and dasherises", () => {
    expect(slugify("Morning Breath Work")).toBe("morning-breath-work");
  });
  it("strips punctuation and edges", () => {
    expect(slugify("  Hello, World! ")).toBe("hello-world");
  });
});

describe("uid", () => {
  it("produces unique values across calls", () => {
    const ids = new Set(Array.from({ length: 200 }, () => uid()));
    expect(ids.size).toBe(200);
  });
});

describe("makeGss", () => {
  it("defaults durationMin to 25 and stamps timestamps", () => {
    const g = makeGss({ title: "x", type: "baseline" });
    expect(g.durationMin).toBe(25);
    expect(g.runs).toEqual([]);
    expect(g.createdAt).toBeTruthy();
    expect(g.updatedAt).toBeTruthy();
  });
  it("derives a slug name from title when none given", () => {
    const g = makeGss({ title: "Identity Install", type: "upgrade" });
    expect(g.name).toBe("identity-install");
  });
  it("respects an explicit name", () => {
    const g = makeGss({ title: "x", type: "baseline", name: "custom-name" });
    expect(g.name).toBe("custom-name");
  });
});
