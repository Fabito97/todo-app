import { describe, it, expect } from "vitest";
import { formatShortDate, isOverdue, formatOverdueLabel } from "@/lib/date-utils";

describe("date-utils", () => {
  describe("formatShortDate", () => {
    it("formats ISO date string YYYY-MM-DD to short format Mon D, YYYY", () => {
      expect(formatShortDate("2026-09-30")).toBe("Sep 30, 2026");
      expect(formatShortDate("2026-01-05")).toBe("Jan 5, 2026");
      expect(formatShortDate("2025-12-25")).toBe("Dec 25, 2025");
    });

    it("returns empty string for null, undefined, or empty values", () => {
      expect(formatShortDate(null)).toBe("");
      expect(formatShortDate(undefined)).toBe("");
      expect(formatShortDate("")).toBe("");
    });
  });

  describe("isOverdue", () => {
    it("returns false if completed", () => {
      expect(isOverdue("2026-09-20", true, "2026-09-30")).toBe(false);
    });

    it("returns false if dueDate is not provided", () => {
      expect(isOverdue(null, false, "2026-09-30")).toBe(false);
      expect(isOverdue(undefined, false, "2026-09-30")).toBe(false);
    });

    it("returns true if dueDate is before reference date and uncompleted", () => {
      expect(isOverdue("2026-09-28", false, "2026-09-30")).toBe(true);
    });

    it("returns false if dueDate is on or after reference date", () => {
      expect(isOverdue("2026-09-30", false, "2026-09-30")).toBe(false);
      expect(isOverdue("2026-10-01", false, "2026-09-30")).toBe(false);
    });
  });

  describe("formatOverdueLabel", () => {
    it("formats overdue label as 'Overdue (Mon D)'", () => {
      expect(formatOverdueLabel("2026-09-28")).toBe("Overdue (Sep 28)");
      expect(formatOverdueLabel("2026-01-02")).toBe("Overdue (Jan 2)");
    });
  });
});
