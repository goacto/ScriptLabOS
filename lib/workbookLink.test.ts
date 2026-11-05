import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { workbookUrl, WORKBOOK_BASE } from "./workbookLink";

describe("quiet workbook link", () => {
  it("points at the real product with utm tags", () => {
    const u = new URL(workbookUrl());
    expect(u.origin + u.pathname).toBe(WORKBOOK_BASE);
    expect(u.searchParams.get("utm_source")).toBe("scriptlabos");
    expect(u.searchParams.get("utm_campaign")).toBe("evening_reflection");
  });
  it("is a plain link, not a pop-up", () => {
    const src = readFileSync(path.resolve(__dirname, "../components/DayBuilder.tsx"), "utf8");
    expect(src).toContain('data-testid="workbook-quiet-link"');
    expect(src).not.toMatch(/window\.open|alert\(|confirm\(/);
  });
});
