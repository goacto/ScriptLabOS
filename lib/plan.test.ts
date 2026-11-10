import { describe, expect, it } from "vitest";
import { fidelityPercent, plannedScriptIds } from "./plan";

describe("plannedScriptIds", () => {
  const packages = [
    { id: "morning", scriptIds: ["breath", "read"] },
    { id: "empty", scriptIds: [] },
  ];

  it("includes a lone script and every script inside a placed package", () => {
    const ids = plannedScriptIds(
      [
        { scriptId: "breath" },
        { packageId: "morning" },
        {},
      ],
      packages
    );
    expect(ids.sort()).toEqual(["breath", "read"]);
  });

  it("ignores a package id that is no longer in the library", () => {
    expect(
      plannedScriptIds([{ packageId: "gone" }], packages)
    ).toEqual([]);
  });
});

describe("fidelityPercent", () => {
  it("is 0 when nothing was planned", () => {
    expect(fidelityPercent([], ["breath"])).toBe(0);
  });

  it("counts a script once even if the completed list repeats it", () => {
    expect(fidelityPercent(["breath", "read"], ["breath", "breath"])).toBe(50);
  });
});
