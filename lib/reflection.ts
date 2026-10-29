import type { DailyReflection, GrowGive } from "./types";

/** Ch10 "don't grade it": record what ran; tomorrow's focus is optional. */
export function canShipDay(reflection: DailyReflection): boolean {
  return reflection.wins.trim() !== "" && reflection.challenges.trim() !== "";
}

/** Toggle Grow or Give on or off. Nothing is selected by default. */
export function toggleGrowGive(list: GrowGive[] | undefined, v: GrowGive): GrowGive[] {
  const cur = list ?? [];
  return cur.includes(v) ? cur.filter((x) => x !== v) : (["grow", "give"] as GrowGive[]).filter((x) => x === v || cur.includes(x));
}
