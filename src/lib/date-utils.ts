const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Formats a YYYY-MM-DD string into "Mon D, YYYY" (e.g. "Sep 30, 2026").
 * Does not suffer from timezone drift because it parses the date parts directly.
 */
export function formatShortDate(dateStr?: string | null): string {
  if (!dateStr || typeof dateStr !== "string") return "";
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(monthIdx) || isNaN(day) || monthIdx < 0 || monthIdx > 11) {
    return dateStr;
  }

  const month = MONTHS_SHORT[monthIdx];
  return `${month} ${day}, ${year}`;
}

/**
 * Checks if a task is overdue relative to a reference date (defaults to today).
 */
export function isOverdue(
  dueDate?: string | null,
  completed?: boolean,
  referenceDate?: string
): boolean {
  if (completed || !dueDate) return false;
  const todayStr = referenceDate || new Date().toISOString().slice(0, 10);
  return dueDate < todayStr;
}

/**
 * Formats an overdue badge label, e.g. "Overdue (Sep 28)".
 */
export function formatOverdueLabel(dueDate?: string | null): string {
  if (!dueDate) return "Overdue";
  const parts = dueDate.split("-");
  if (parts.length < 3) return `Overdue (${dueDate})`;

  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(monthIdx) || isNaN(day) || monthIdx < 0 || monthIdx > 11) {
    return `Overdue (${dueDate})`;
  }

  const month = MONTHS_SHORT[monthIdx];
  return `Overdue (${month} ${day})`;
}
