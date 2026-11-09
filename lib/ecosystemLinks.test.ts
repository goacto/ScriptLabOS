import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GOACTO_LINE } from "./onboarding";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function src(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

const SURFACES = [
  "components/Splash.tsx",
  "components/OnboardingWizard.tsx",
  "app/settings/page.tsx",
];

function anchorTag(source: string, testId: string) {
  const tag = source.match(
    new RegExp(`<a\\b[^>]*data-testid="${testId}"[^>]*>`)
  );
  expect(tag, testId).not.toBeNull();
  return tag?.[0] ?? "";
}

describe("Focus Log and free book guide links", () => {
  const footer = src("components/EcosystemFooter.tsx");

  it("fails if the Focus Log link or the free-guide link disappears", () => {
    expect(footer).toContain("https://focus.goacto.com");
    expect(footer).toContain("https://goacto.com/pages/free-book-guide");
    expect(footer).toContain("Free one-page book guide");
    expect(footer).toContain(
      "ScriptLabOS: build habits as code in a terminal-style OS."
    );
    expect(footer).toContain("the main focus app");
    expect(footer).toContain("https://mindscape.goacto.com");
    expect(footer).toContain("a focus game");

    const focusAt = footer.indexOf("https://focus.goacto.com");
    const mindAt = footer.indexOf("https://mindscape.goacto.com");
    expect(focusAt).toBeGreaterThan(-1);
    expect(mindAt).toBeGreaterThan(focusAt);

    for (const testId of ["focus-log-link", "free-book-guide"]) {
      const tag = anchorTag(footer, testId);
      expect(tag).not.toMatch(/\bhidden\b|sr-only|display:\s*none/);
    }

    for (const file of SURFACES) {
      const text = src(file);
      expect(text).toContain("<EcosystemFooter");
      expect(text).not.toMatch(/href=["'][^"']*apptotext/i);
      expect(text).not.toMatch(
        /href=["'][^"']*siagentspace\.com(?!\/api\/ping)/i
      );
    }
  });

  it("keeps the mission line's and, and leaves /book and the workbook link alone", () => {
    expect(GOACTO_LINE).toBe("Growing Ourselves and Contributing To Others");
    expect(GOACTO_LINE).toContain(" and ");
    expect(footer).not.toMatch(/href=["']\/book["']/);
    expect(src("components/NavBar.tsx")).not.toContain('href: "/book"');
    expect(src("components/DayBuilder.tsx")).toContain(
      'data-testid="workbook-quiet-link"'
    );
    expect(src("lib/workbookLink.ts")).toContain(
      "https://goacto.com/products/30-day-habit-builder-workbook"
    );
    expect(src("components/NavBar.tsx")).not.toContain("focus.goacto.com");
    expect(src("app/layout.tsx")).not.toContain("atomic-habits");
  });
});
