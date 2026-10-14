import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { canShipDay } from "./reflection";

const root = path.resolve(__dirname, "..");
const uiFiles = ["components", "app"].flatMap((dir) =>
  readdirSync(path.join(root, dir), { recursive: true, encoding: "utf8" })
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => path.join(dir, f))
);
uiFiles.push("lib/gamification.ts");

// Copy that contradicts Ch7 "Branch Before You Delete" / Ch10 "don't grade it".
const BANNED = [
  /Eliminated Scripts/,
  /days to elimination/,
  /Resurrect/,
  /Quarantined/,
  /beliefs to delete/,
  /green build/i,
  /All fields required/,
  /All reflection fields are required/,
  /"Build Quality"|>\s*Build Quality/,
];

describe("book-aligned copy (Ch7 / Ch10)", () => {
  it.each(BANNED.map((re) => [re.source, re] as const))("UI no longer says %s", (_name, re) => {
    const hits = uiFiles.filter((f) => re.test(readFileSync(path.join(root, f), "utf8")));
    expect(hits).toEqual([]);
  });

  it("tomorrow's focus is optional when shipping a day", () => {
    expect(canShipDay({ wins: "breath at 6:10", challenges: "phone at lunch", tomorrowFocus: "" })).toBe(true);
    expect(canShipDay({ wins: "", challenges: "phone at lunch", tomorrowFocus: "x" })).toBe(false);
  });
});
