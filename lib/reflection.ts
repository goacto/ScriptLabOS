import { shiftDate } from "./dates";
import type { DailyReflection, Executable } from "./types";

/** Ch10 "don't grade it": record what ran; tomorrow's focus is optional. */
export function canShipDay(reflection: DailyReflection): boolean {
  return reflection.wins.trim() !== "" && reflection.challenges.trim() !== "";
}

/** Optional focus written on the previous local day, or "" when none was saved. */
export function priorDayFocus(
  executables: Pick<Executable, "date" | "reflection">[],
  today: string
): string {
  const prior = shiftDate(today, -1);
  return (
    executables.find((exe) => exe.date === prior)?.reflection?.tomorrowFocus?.trim() ??
    ""
  );
}
