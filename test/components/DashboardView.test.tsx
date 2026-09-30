import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DashboardView } from "@/components/DashboardView";
import { Todo } from "@/lib/schemas";

const todayStr = new Date().toISOString().slice(0, 10);

const sampleTodos: Todo[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    title: "Critical Client Issue",
    completed: false,
    priority: "high",
    category: "Work",
    dueDate: todayStr,
    startTime: "09:00",
    endTime: "10:30",
    description: "Urgent fix required",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    title: "All-Day Documentation",
    completed: true,
    priority: "medium",
    category: "Docs",
    dueDate: todayStr,
    startTime: null,
    endTime: null,
    description: "",
    createdAt: new Date(Date.now() - 10000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    title: "Backlog Roadmap Review",
    completed: false,
    priority: "low",
    category: "Planning",
    dueDate: null,
    startTime: null,
    endTime: null,
    description: "",
    createdAt: new Date(Date.now() - 20000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("DashboardView component", () => {
  it("renders 4 metric cards with live counts", () => {
    render(
      <DashboardView
        todos={sampleTodos}
        onQuickAdd={vi.fn()}
        onToggle={vi.fn()}
        onEditTask={vi.fn()}
      />
    );

    const totalCard = screen.getByRole("region", { name: /total tasks metric/i });
    expect(totalCard).toHaveTextContent("3");

    const activeCard = screen.getByRole("region", { name: /active tasks metric/i });
    expect(activeCard).toHaveTextContent("2");

    const completedCard = screen.getByRole("region", { name: /completed metric/i });
    expect(completedCard).toHaveTextContent("1");

    const criticalCard = screen.getByRole("region", { name: /critical tasks metric/i });
    expect(criticalCard).toHaveTextContent("1");
    expect(criticalCard).toHaveTextContent("high priority");
  });

  it("allows submitting a title-only task via Quick Add bar", async () => {
    const handleQuickAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <DashboardView
        todos={sampleTodos}
        onQuickAdd={handleQuickAdd}
        onToggle={vi.fn()}
        onEditTask={vi.fn()}
      />
    );

    const input = screen.getByRole("textbox", { name: /quick add task title/i });
    const addBtn = screen.getByRole("button", { name: /quick add task/i });

    await user.type(input, "Urgent Hotfix");
    await user.click(addBtn);

    expect(handleQuickAdd).toHaveBeenCalledWith("Urgent Hotfix");
    expect(input).toHaveValue("");
  });

  it("renders Today's Tasks panel, Critical panel, and Recent panel", () => {
    render(
      <DashboardView
        todos={sampleTodos}
        onQuickAdd={vi.fn()}
        onToggle={vi.fn()}
        onEditTask={vi.fn()}
      />
    );

    const todayPanel = screen.getByRole("region", { name: /today's tasks/i });
    expect(todayPanel).toHaveTextContent("Critical Client Issue");
    expect(todayPanel).toHaveTextContent("All-Day Documentation");

    const criticalPanel = screen.getByRole("region", { name: /important and critical tasks/i });
    expect(criticalPanel).toHaveTextContent("Critical Client Issue");
    expect(criticalPanel).not.toHaveTextContent("All-Day Documentation");

    const recentPanel = screen.getByRole("region", { name: /recent tasks/i });
    expect(recentPanel).toHaveTextContent("Critical Client Issue");
    expect(recentPanel).toHaveTextContent("All-Day Documentation");
    expect(recentPanel).toHaveTextContent("Backlog Roadmap Review");
  });

  it("renders Today's tasks with TodoItem cards and delegates details/edit/delete callbacks", async () => {
    const handleOpenDetails = vi.fn();
    const handleOpenEdit = vi.fn();
    const handleDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <DashboardView
        todos={sampleTodos}
        onQuickAdd={vi.fn()}
        onToggle={vi.fn()}
        onEditTask={handleOpenEdit}
        onOpenDetails={handleOpenDetails}
        onDelete={handleDelete}
      />
    );

    const todayPanel = screen.getByRole("region", { name: /today's tasks/i });
    const viewDetailsBtn = within(todayPanel).getByRole("button", {
      name: /view details for critical client issue/i,
    });
    await user.click(viewDetailsBtn);
    expect(handleOpenDetails).toHaveBeenCalledWith(sampleTodos[0]);

    const editBtn = within(todayPanel).getByRole("button", {
      name: /edit critical client issue/i,
    });
    await user.click(editBtn);
    expect(handleOpenEdit).toHaveBeenCalledWith(sampleTodos[0]);
  });
});

