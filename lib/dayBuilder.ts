import type { ExecutableSlot } from "./types";

/**
 * Move a placed item from one hour to another (phone tap-to-move).
 * Swaps the two slots' contents and keeps each slot's time.
 */
export function moveSlot(
  slots: ExecutableSlot[],
  from: number,
  to: number
): ExecutableSlot[] {
  if (from === to || !slots[from] || !slots[to]) return slots;
  const next = [...slots];
  const a = slots[from];
  const b = slots[to];
  next[to] = { ...a, time: b.time };
  next[from] = { ...b, time: a.time };
  return next;
}
