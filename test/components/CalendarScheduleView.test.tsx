import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CalendarScheduleView } from "@/components/CalendarScheduleView";
import type { Todo } from "@/lib/schemas";

describe("CalendarScheduleView", () => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const makeTodo = (overrides: Partial<Todo>): Todo => ({
    id: "00000000-0000-4000-8000-000000000001",
    title: "Sample Task",
    description: "",
    completed: false,
    priority: "medium",
    dueDate: todayStr,
    startTime: null,
    endTime: null,
    category: "Work",
    createdAt: "2026-09-30T07:00:00.000Z",
    updatedAt: "2026-09-30T07:00:00.000Z",
    ...overrides,
  });

  it("renders time-blocked tasks in chronological order and all-day tasks for the selected date, and switches dates", async () => {
    const user = userEvent.setup();
    const todos: Todo[] = [
      makeTodo({
        id: "00000000-0000-4000-8000-000000000001",
        title: "Design Review",
        dueDate: todayStr,
        startTime: "13:00",
        endTime: "14:00",
      }),
      makeTodo({
        id: "00000000-0000-4000-8000-000000000002",
        title: "Architecture Kickoff",
        dueDate: todayStr,
        startTime: "09:00",
        endTime: "10:00",
      }),
      makeTodo({
        id: "00000000-0000-4000-8000-000000000003",
        title: "Submit Weekly Report",
        dueDate: todayStr,
        startTime: null,
        endTime: null,
      }),
      makeTodo({
        id: "00000000-0000-4000-8000-000000000004",
        title: "Release Planning",
        dueDate: "2026-10-15",
        startTime: "11:00",
        endTime: "12:00",
      }),
    ];

    render(<CalendarScheduleView todos={todos} onToggle={vi.fn()} />);

    const timeBlockedRegion = screen.getByRole("region", { name: /time-blocked schedule/i });
    const scheduledItems = within(timeBlockedRegion).getAllByRole("listitem");
    expect(scheduledItems).toHaveLength(2);
    expect(scheduledItems[0]).toHaveTextContent("Architecture Kickoff");
    expect(scheduledItems[0]).toHaveTextContent("09:00 – 10:00");
    expect(scheduledItems[1]).toHaveTextContent("Design Review");
    expect(scheduledItems[1]).toHaveTextContent("13:00 – 14:00");

    const allDayRegion = screen.getByRole("region", { name: /all-day tasks/i });
    expect(within(allDayRegion).getByText("Submit Weekly Report")).toBeInTheDocument();

    // Switch date using the date picker
    const dateInput = screen.getByLabelText(/select schedule date/i);
    await user.clear(dateInput);
    await user.type(dateInput, "2026-10-15");

    expect(within(timeBlockedRegion).getByText("Release Planning")).toBeInTheDocument();
    expect(within(timeBlockedRegion).getByText("11:00 – 12:00")).toBeInTheDocument();
  });
});
