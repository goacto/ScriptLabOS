import type { DailyReflection } from "./types";

/** Ch10 "don't grade it": record what ran; tomorrow's focus is optional. */
export function canShipDay(reflection: DailyReflection): boolean {
  return reflection.wins.trim() !== "" && reflection.challenges.trim() !== "";
}
