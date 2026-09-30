import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TodoItem } from "@/components/TodoItem";
import type { Todo } from "@/lib/schemas";

const mockTodo: Todo = {
  id: "12345678-1234-1234-1234-123456789abc",
  title: "Test todo item",
  completed: false,
  createdAt: "2026-09-29T10:00:00.000Z",
  updatedAt: "2026-09-29T10:00:00.000Z",
  description: "Detailed description here",
  priority: "high",
  dueDate: "2026-01-01", // Past date to test overdue
  startTime: "09:00",
  endTime: "10:30",
  category: "Work",
};

describe("TodoItem (V1.4 view-only row)", () => {
  it("renders todo title, priority badge, category tag, 1-line description, and overdue indicator with short date", () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onOpenEdit={vi.fn()}
        onOpenDetails={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Test todo item")).toBeInTheDocument();
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
    expect(screen.getByText("09:00 – 10:30")).toBeInTheDocument();
    expect(screen.getByText("Detailed description here")).toHaveClass("line-clamp-1");
  });

  it("renders short date format and exact mockup left border classes", () => {
    const futureTodo: Todo = {
      ...mockTodo,
      id: "future-id",
      dueDate: "2026-10-15",
      completed: false,
      priority: "medium",
    };

    const { container } = render(
      <TodoItem
        todo={futureTodo}
        onToggle={vi.fn()}
        onOpenEdit={vi.fn()}
        onOpenDetails={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Due: Oct 15, 2026")).toBeInTheDocument();
    const item = container.querySelector("li");
    expect(item).toHaveClass("border-l-4");
    expect(item).toHaveClass("border-l-amber-500");
  });

  it("toggles completion when checkbox is clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onOpenEdit={vi.fn()}
        onOpenDetails={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /toggle completion for test todo item/i,
    });
    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith(mockTodo.id, true);
  });

  it("triggers onOpenDetails modal when title is clicked", async () => {
    const onOpenDetails = vi.fn();
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onOpenEdit={vi.fn()}
        onOpenDetails={onOpenDetails}
        onDelete={vi.fn()}
      />
    );

    const titleBtn = screen.getByRole("button", {
      name: /view details for test todo item/i,
    });
    await user.click(titleBtn);

    expect(onOpenDetails).toHaveBeenCalledWith(mockTodo);
  });

  it("triggers onOpenDetails modal when card body is clicked", async () => {
    const onOpenDetails = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onOpenEdit={vi.fn()}
        onOpenDetails={onOpenDetails}
        onDelete={vi.fn()}
      />
    );

    const card = container.querySelector("li");
    expect(card).toBeInTheDocument();
    if (card) await user.click(card);
    expect(onOpenDetails).toHaveBeenCalledWith(mockTodo);
  });

  it("triggers onOpenEdit modal when Edit button is clicked", async () => {
    const onOpenEdit = vi.fn();
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onOpenEdit={onOpenEdit}
        onOpenDetails={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const editBtn = screen.getByRole("button", {
      name: `Edit ${mockTodo.title}`,
    });
    await user.click(editBtn);

    expect(onOpenEdit).toHaveBeenCalledWith(mockTodo);
  });

  it("handles delete with inline confirmation", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onOpenEdit={vi.fn()}
        onOpenDetails={vi.fn()}
        onDelete={onDelete}
      />
    );

    const deleteBtn = screen.getByRole("button", {
      name: `Delete ${mockTodo.title}`,
    });
    await user.click(deleteBtn);

    expect(screen.getByText("Confirm delete?")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: /confirm delete/i });
    await user.click(confirmBtn);

    expect(onDelete).toHaveBeenCalledWith(mockTodo.id);
  });
});
