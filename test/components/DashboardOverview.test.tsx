import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DashboardOverview } from "@/components/DashboardOverview";
import type { Todo } from "@/lib/schemas";

describe("DashboardOverview", () => {
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

  it("shows empty state when no tasks are due today and displays 0% progress", () => {
    render(<DashboardOverview todos={[]} onToggle={vi.fn()} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    const todayRegion = screen.getByRole("region", { name: /tasks for the day/i });
    expect(within(todayRegion).getByText(/no tasks scheduled for today/i)).toBeInTheDocument();
  });

  it("renders today's tasks ordered chronologically by startTime and allows toggling completion", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    const todos: Todo[] = [
      makeTodo({
        id: "00000000-0000-4000-8000-000000000001",
        title: "Afternoon Sync",
        dueDate: todayStr,
        startTime: "14:00",
        endTime: "15:00",
      }),
      makeTodo({
        id: "00000000-0000-4000-8000-000000000002",
        title: "Morning Standup",
        dueDate: todayStr,
        startTime: "09:00",
        endTime: "09:30",
      }),
      makeTodo({
        id: "00000000-0000-4000-8000-000000000003",
        title: "Unscheduled Today Task",
        dueDate: todayStr,
        startTime: null,
        endTime: null,
      }),
      makeTodo({
        id: "00000000-0000-4000-8000-000000000004",
        title: "Future Task",
        dueDate: "2099-12-31",
        completed: true,
      }),
    ];

    render(<DashboardOverview todos={todos} onToggle={onToggle} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");

    const todayRegion = screen.getByRole("region", { name: /tasks for the day/i });
    const items = within(todayRegion).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Morning Standup");
    expect(items[0]).toHaveTextContent("09:00 – 09:30");
    expect(items[1]).toHaveTextContent("Afternoon Sync");
    expect(items[1]).toHaveTextContent("14:00 – 15:00");
    expect(items[2]).toHaveTextContent("Unscheduled Today Task");

    await user.click(
      within(todayRegion).getByRole("checkbox", {
        name: /complete today's task morning standup/i,
      })
    );
    expect(onToggle).toHaveBeenCalledWith("00000000-0000-4000-8000-000000000002", true);
  });
});
