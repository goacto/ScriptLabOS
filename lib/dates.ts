/**
 * Calendar dates in the user's local timezone.
 *
 * Do not derive a day key with `toISOString().slice(0, 10)`. That is the UTC
 * date, so for US timezones the day rolls forward in the evening (00:00 UTC).
 * Date-only strings (`YYYY-MM-DD`) must also be parsed as local calendar
 * dates. `new Date("2026-10-26")` is UTC midnight, which is the previous
 * evening in the US and labels the wrong day.
 */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function localDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayStr(now: Date = new Date()): string {
  return localDateStr(now);
}

/** Local calendar day for an absolute timestamp. Invalid input returns "". */
export function instantToLocalDate(isoOrMs: string | number | Date): string {
  const date =
    isoOrMs instanceof Date
      ? isoOrMs
      : new Date(isoOrMs);
  if (Number.isNaN(date.getTime())) return "";
  return localDateStr(date);
}

export function isOnLocalDay(timestamp: string, day: string): boolean {
  return instantToLocalDate(timestamp) === day;
}

/** Noon on that local calendar day, or null if the string is not YYYY-MM-DD. */
export function parseLocalDay(dateStr: string): Date | null {
  const match = DATE_RE.exec(dateStr);
  if (!match) return null;
  const y = Number(match[1]);
  const mo = Number(match[2]);
  const d = Number(match[3]);
  const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
    return null;
  }
  return dt;
}

export function shiftDate(dateStr: string, days: number): string {
  const dt = parseLocalDay(dateStr);
  if (!dt) return dateStr;
  dt.setDate(dt.getDate() + days);
  return localDateStr(dt);
}

/** Positive when `later` is after `earlier` on the local calendar. */
export function calendarDaysBetween(earlier: string, later: string): number {
  const a = parseLocalDay(earlier);
  const b = parseLocalDay(later);
  if (!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function lastNDates(count: number, now: Date = new Date()): string[] {
  const today = todayStr(now);
  return Array.from({ length: count }, (_, i) =>
    shiftDate(today, i - (count - 1))
  );
}

/** Format a YYYY-MM-DD key without shifting it through UTC. */
export function formatMonthDay(dateStr: string): string {
  const dt = parseLocalDay(dateStr);
  if (!dt) return dateStr;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function greetingFor(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
