/** One quiet link after the evening reflection. No pop-up, no timer, no nag. */
export const WORKBOOK_BASE = "https://goacto.com/products/30-day-habit-builder-workbook";

export function workbookUrl(): string {
  const q = new URLSearchParams({
    utm_source: "scriptlabos",
    utm_medium: "app",
    utm_campaign: "evening_reflection",
  });
  return `${WORKBOOK_BASE}?${q.toString()}`;
}
