import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CalendarView } from "@/components/CalendarView";
import { Todo } from "@/lib/schemas";

const todayStr = new Date().toISOString().slice(0, 10);

const sampleTodos: Todo[] = [
  {
    id: "cal-0000-0000-0000-000000000001",
    title: "Morning Sprint Standup",
    completed: false,
    priority: "high",
    category: "Work",
    dueDate: todayStr,
    startTime: "09:00",
    endTime: "10:00",
    description: "Daily engineering standup",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cal-0000-0000-0000-000000000002",
    title: "Review Design System",
    completed: true,
    priority: "medium",
    category: "Design",
    dueDate: todayStr,
    startTime: "14:00",
    endTime: "15:30",
    description: "Review component specs",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cal-0000-0000-0000-000000000003",
    title: "Submit Expenses",
    completed: false,
    priority: "low",
    category: "Finance",
    dueDate: todayStr,
    startTime: null,
    endTime: null,
    description: "Monthly expense report",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("CalendarView component", () => {
  it("renders 7-column month grid with weekday headers", () => {
    render(
      <CalendarView
        todos={sampleTodos}
        onToggle={vi.fn()}
        onOpenEdit={vi.fn()}
        onOpenDetails={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const monthSection = screen.getByRole("region", { name: /monthly calendar/i });
    expect(monthSection).toBeInTheDocument();

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it("highlights today's date prominently and shows task indicator dots", () => {
    render(
      <CalendarView
        todos={sampleTodos}
        onToggle={vi.fn()}
        onOpenEdit={vi.fn()}
        onOpenDetails={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const todayDayNumeral = new Date().getDate().toString();
    const todayButton = screen.getByRole("button", {
      name: new RegExp(todayStr, "i"),
    });
    expect(todayButton).toBeInTheDocument();
    expect(todayButton).toHaveTextContent(todayDayNumeral);
    expect(todayButton).toHaveTextContent(/today/i);

    // Today indicator dot: high priority task exists, so indicator should be present
    const highPriorityDot = screen.getByTestId(`task-dot-high-${todayStr}`);
    expect(highPriorityDot).toBeInTheDocument();
  });

  it("navigates previous and next month and jumps back to today", async () => {
    const user = userEvent.setup();
    render(
      <CalendarView
        todos={sampleTodos}
        onToggle={vi.fn()}
        onOpenEdit={vi.fn()}
        onOpenDetails={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const prevBtn = screen.getByRole("button", { name: /previous month/i });
    const nextBtn = screen.getByRole("button", { name: /next month/i });
    const todayBtn = screen.getByRole("button", { name: /jump to today|today/i });

    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();
    expect(todayBtn).toBeInTheDocument();

    await user.click(nextBtn);
    await user.click(todayBtn);

    // Schedule panel should show today's schedule
    const scheduleAside = screen.getByRole("complementary", { name: /daily schedule/i });
    expect(scheduleAside).toBeInTheDocument();
  });

  it("renders daily schedule panel with time-blocked slots and all-day items for selected date", async () => {
    const handleToggle = vi.fn();
    const handleOpenEdit = vi.fn();
    const handleOpenDetails = vi.fn();

    const user = userEvent.setup();

    render(
      <CalendarView
        todos={sampleTodos}
        onToggle={handleToggle}
        onOpenEdit={handleOpenEdit}
        onOpenDetails={handleOpenDetails}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Morning Sprint Standup")).toBeInTheDocument();
    expect(screen.getByText("09:00 – 10:00")).toBeInTheDocument();
    expect(screen.getByText("Review Design System")).toBeInTheDocument();
    expect(screen.getByText("14:00 – 15:30")).toBeInTheDocument();
    expect(screen.getByText("Submit Expenses")).toBeInTheDocument();

    // Toggle completion on schedule item
    const standupCheckbox = screen.getByRole("checkbox", {
      name: /toggle completion for morning sprint standup/i,
    });
    await user.click(standupCheckbox);
    expect(handleToggle).toHaveBeenCalledWith("cal-0000-0000-0000-000000000001", true);

    // Click title to open details
    const titleButton = screen.getByRole("button", {
      name: /view details for morning sprint standup/i,
    });
    await user.click(titleButton);
    expect(handleOpenDetails).toHaveBeenCalledWith(sampleTodos[0]);
  });

  it("shows empty state when no tasks are scheduled for the selected date", async () => {
    const user = userEvent.setup();
    render(
      <CalendarView
        todos={[]}
        onToggle={vi.fn()}
        onOpenEdit={vi.fn()}
        onOpenDetails={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/no tasks scheduled for this date/i)).toBeInTheDocument();
  });
});
