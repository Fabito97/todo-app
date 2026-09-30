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
  it("renders only the filter/sort bar and task board without duplicate title or button", () => {
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
      />
    );

    // Filter and sort bar region exists
    expect(screen.getByRole("region", { name: /task filters and sorting/i })).toBeInTheDocument();

    // Task board region exists
    expect(screen.getByRole("region", { name: /task list board/i })).toBeInTheDocument();

    // No internal duplicate heading or button inside the task section
    expect(screen.queryByRole("heading", { level: 2, name: "Tasks" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open new task modal from tasks view/i })).not.toBeInTheDocument();
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

  it("renders polished empty state when search term yields zero matches", () => {
    render(
      <TasksView
        todos={[]}
        totalCount={1}
        activeCount={1}
        filter="all"
        onFilterChange={vi.fn()}
        priorityFilter="all"
        onPriorityFilterChange={vi.fn()}
        categoryFilter="all"
        onCategoryFilterChange={vi.fn()}
        categories={["Design"]}
        searchTerm="nonexistent task"
        onSearchChange={vi.fn()}
        sortBy="newest"
        onSortChange={vi.fn()}
        onToggle={vi.fn()}
        onOpenEdit={vi.fn()}
        onOpenDetails={vi.fn()}
        onDelete={vi.fn()}
        onOpenNewTask={vi.fn()}
      />
    );

    expect(screen.getByText(/no tasks matching "nonexistent task"/i)).toBeInTheDocument();
  });
});
