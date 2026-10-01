import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { NotificationCenter } from "@/components/NotificationCenter";
import type { Todo } from "@/lib/schemas";

describe("NotificationCenter", () => {
  const todayStr = new Date().toISOString().slice(0, 10);

  const makeTodo = (overrides: Partial<Todo>): Todo => ({
    id: "00000000-0000-4000-8000-000000000001",
    title: "Sample Task",
    description: "",
    completed: false,
    priority: "high",
    dueDate: todayStr,
    startTime: "10:00",
    endTime: "11:00",
    category: "Work",
    createdAt: "2026-09-30T07:00:00.000Z",
    updatedAt: "2026-09-30T07:00:00.000Z",
    ...overrides,
  });

  it("displays badge count for overdue and today's active tasks and toggles notification panel on click", async () => {
    const user = userEvent.setup();
    const todos: Todo[] = [
      makeTodo({
        id: "00000000-0000-4000-8000-000000000001",
        title: "Overdue Deliverable",
        dueDate: "2020-01-01",
        completed: false,
      }),
      makeTodo({
        id: "00000000-0000-4000-8000-000000000002",
        title: "Today Client Call",
        dueDate: todayStr,
        startTime: "10:00",
        endTime: "11:00",
        completed: false,
      }),
      makeTodo({
        id: "00000000-0000-4000-8000-000000000003",
        title: "Completed Today Task",
        dueDate: todayStr,
        completed: true,
      }),
    ];

    render(<NotificationCenter todos={todos} />);

    const bellBtn = screen.getByRole("button", { name: /notifications/i });
    expect(bellBtn).toHaveTextContent("2");

    await user.click(bellBtn);

    const panel = screen.getByRole("region", { name: /notifications panel/i });
    expect(panel).toBeInTheDocument();
    expect(within(panel).getByText("Overdue Deliverable")).toBeInTheDocument();
    expect(within(panel).getByText("Today Client Call")).toBeInTheDocument();
    expect(within(panel).queryByText("Completed Today Task")).not.toBeInTheDocument();
  });

  it("renders NotificationModal when isOpen is true and triggers onClose", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();
    const todos: Todo[] = [
      makeTodo({
        id: "00000000-0000-4000-8000-000000000001",
        title: "Overdue Deliverable",
        dueDate: "2020-01-01",
        completed: false,
      }),
    ];

    const { NotificationModal } = await import("@/components/NotificationCenter");

    const { rerender } = render(
      <NotificationModal isOpen={false} onClose={handleClose} todos={todos} />
    );
    expect(screen.queryByRole("dialog", { name: /notifications panel/i })).not.toBeInTheDocument();

    rerender(<NotificationModal isOpen={true} onClose={handleClose} todos={todos} />);
    const dialog = screen.getByRole("dialog", { name: /notifications panel/i });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Overdue Deliverable")).toBeInTheDocument();

    // Close button triggers onClose
    const closeBtn = screen.getByRole("button", { name: /close notifications/i });
    await user.click(closeBtn);
    expect(handleClose).toHaveBeenCalledOnce();
  });
});
