import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function src(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("player experience copy and navigation", () => {
  it("renames a partial log without quit wording and keeps Log session primary", () => {
    const timer = src("components/PomodoroTimer.tsx");
    expect(timer).toContain("Log what I did");
    expect(timer).toContain("log session");
    expect(timer).toContain("btn-primary");
    expect(timer).not.toContain("bail (log partial)");
  });

  it("uses the shared nav on history, analytics, and settings", () => {
    for (const page of [
      "app/history/page.tsx",
      "app/analytics/page.tsx",
      "app/settings/page.tsx",
    ]) {
      const text = src(page);
      expect(text).toContain("<NavBar />");
      expect(text).not.toContain("Back to Dashboard");
    }
  });
});
