import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TasksView } from "@/components/TasksView";
import { Todo } from "@/lib/schemas";

const sampleTodos: Todo[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    title: "Task in Board",
    completed: false,
    priority: "high",
    category: "Design",
    dueDate: "2026-10-10",
    startTime: "10:00",
    endTime: "11:30",
    description: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("TasksView component", () => {
  it("renders header with task count and '+ New Task' button", async () => {
    const handleOpenNewTask = vi.fn();
    const user = userEvent.setup();

    render(
      <TasksView
        todos={sampleTodos}
        totalCount={1}
        activeCount={1}
        filter="all"
        onFilterChange={vi.fn()}
        priorityFilter="all"
        onPriorityFilterChange={vi.fn()}
        categoryFilter="all"
        onCategoryFilterChange={vi.fn()}
        categories={["Design"]}
        sortBy="newest"
        onSortChange={vi.fn()}
        onToggle={vi.fn()}
        onOpenEdit={vi.fn()}
        onOpenDetails={vi.fn()}
        onDelete={vi.fn()}
        onOpenNewTask={handleOpenNewTask}
      />
    );

    expect(screen.getByRole("heading", { level: 2, name: "Tasks" })).toBeInTheDocument();
    expect(screen.getByText(/1 task/i)).toBeInTheDocument();

    const newBtn = screen.getByRole("button", { name: /open new task modal from tasks view/i });
    expect(newBtn).toBeInTheDocument();
    await user.click(newBtn);
    expect(handleOpenNewTask).toHaveBeenCalledOnce();
  });

  it("renders filter bar and task item", () => {
    render(
      <TasksView
        todos={sampleTodos}
        totalCount={1}
        activeCount={1}
        filter="all"
        onFilterChange={vi.fn()}
        priorityFilter="all"
        onPriorityFilterChange={vi.fn()}
        categoryFilter="all"
        onCategoryFilterChange={vi.fn()}
        categories={["Design"]}
        sortBy="newest"
        onSortChange={vi.fn()}
        onToggle={vi.fn()}
        onOpenEdit={vi.fn()}
        onOpenDetails={vi.fn()}
        onDelete={vi.fn()}
        onOpenNewTask={vi.fn()}
      />
    );

    expect(screen.getByRole("region", { name: /task filters and sorting/i })).toBeInTheDocument();
    expect(screen.getByText("Task in Board")).toBeInTheDocument();
  });
});
