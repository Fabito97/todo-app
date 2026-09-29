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
  category: "Work",
};

describe("TodoItem", () => {
  it("renders todo title, priority badge, category tag, and overdue indicator", () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Test todo item")).toBeInTheDocument();
    expect(screen.getByText(/high/i)).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it("toggles completion when checkbox is clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const checkbox = screen.getByRole("checkbox", {
      name: /toggle completion for test todo item/i,
    });
    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith(mockTodo.id, true);
  });

  it("enters rich edit mode on edit button click and saves changes", async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    const editBtn = screen.getByRole("button", {
      name: `Edit ${mockTodo.title}`,
    });
    await user.click(editBtn);

    const titleInput = screen.getByRole("textbox", { name: /edit todo title/i });
    const descInput = screen.getByRole("textbox", { name: /edit description/i });
    const lowPriorityBtn = screen.getByRole("button", { name: /priority low/i });
    const saveBtn = screen.getByRole("button", { name: /save changes/i });

    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");
    await user.clear(descInput);
    await user.type(descInput, "Updated Description");
    await user.click(lowPriorityBtn);

    await user.click(saveBtn);

    expect(onEdit).toHaveBeenCalledWith(
      mockTodo.id,
      expect.objectContaining({
        title: "Updated Title",
        description: "Updated Description",
        priority: "low",
      })
    );
  });

  it("cancels edit mode on Escape and restores original title and values", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    const editBtn = screen.getByRole("button", {
      name: `Edit ${mockTodo.title}`,
    });
    await user.click(editBtn);

    const titleInput = screen.getByRole("textbox", { name: /edit todo title/i });
    await user.clear(titleInput);
    await user.type(titleInput, "Something else");
    await user.keyboard("{Escape}");

    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByText("Test todo item")).toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    const deleteBtn = screen.getByRole("button", {
      name: `Delete ${mockTodo.title}`,
    });
    await user.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it("applies distinct priority left-accent border classes for high, medium, and low priority", () => {
    const { rerender } = render(
      <TodoItem
        todo={{ ...mockTodo, priority: "high" }}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const item = screen.getByRole("listitem");
    expect(item.className).toMatch(/border-l-4/);
    expect(item.className).toMatch(/border-l-rose-500/);

    rerender(
      <TodoItem
        todo={{ ...mockTodo, priority: "medium" }}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByRole("listitem").className).toMatch(/border-l-amber-500/);

    rerender(
      <TodoItem
        todo={{ ...mockTodo, priority: "low" }}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByRole("listitem").className).toMatch(/border-l-blue-500/);
  });
});

