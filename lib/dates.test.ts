import { describe, it, expect } from "vitest";
import {
  calendarDaysBetween,
  formatMonthDay,
  greetingFor,
  instantToLocalDate,
  lastNDates,
  todayStr,
} from "./dates";
import { bumpStreak } from "./gamification";
import { emptyState } from "./storage";

/**
 * 8:30 PM America/New_York on 2026-10-26.
 * Eastern Daylight Time is UTC-4 until November 1 2026, so this instant is
 * 00:30 UTC on 2026-10-27. A UTC day key would already say October 27.
 */
const EVENING_ET = new Date("2026-10-27T00:30:00.000Z");

describe("local day at 8:30 PM America/New_York", () => {
  it("uses the local calendar day, not UTC", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
      "America/New_York"
    );
    expect(todayStr(EVENING_ET)).toBe("2026-10-26");
    expect(EVENING_ET.toISOString().slice(0, 10)).toBe("2026-10-27");

    expect(instantToLocalDate("2026-10-27T00:30:00.000Z")).toBe("2026-10-26");
    expect(greetingFor(EVENING_ET)).toBe("Good evening");

    const days = lastNDates(30, EVENING_ET);
    expect(days).toHaveLength(30);
    expect(days[0]).toBe("2026-09-27");
    expect(days[days.length - 1]).toBe("2026-10-26");
    expect(formatMonthDay(days[0])).toBe("Sep 27");
    expect(formatMonthDay(days[days.length - 1])).toBe("Oct 26");

    // Date-only ISO parses as UTC midnight, which is the previous evening
    // in New York. Analytics labels must not go through that path.
    expect(
      new Date("2026-10-26").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ).toBe("Oct 25");
    expect(formatMonthDay("2026-10-26")).toBe("Oct 26");

    const shipped = bumpStreak(
      { ...emptyState, streak: 4, lastPassedDate: "2026-10-25" },
      EVENING_ET
    );
    expect(shipped.lastPassedDate).toBe("2026-10-26");
    expect(shipped.streak).toBe(5);

    // 11:30 PM ET the night before is yesterday, even though it is under 24h ago.
    const lateNight = "2026-10-26T03:30:00.000Z";
    expect(instantToLocalDate(lateNight)).toBe("2026-10-25");
    expect(
      calendarDaysBetween(instantToLocalDate(lateNight), todayStr(EVENING_ET))
    ).toBe(1);
  });
});
