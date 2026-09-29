import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TodoItem } from "./TodoItem";
import type { Todo } from "@/lib/schemas";

const mockTodo: Todo = {
  id: "12345678-1234-1234-1234-123456789abc",
  title: "Test todo item",
  completed: false,
  createdAt: "2026-09-29T10:00:00.000Z",
  updatedAt: "2026-09-29T10:00:00.000Z",
};

describe("TodoItem", () => {
  it("renders todo title and accessible controls", () => {
    render(
      <TodoItem
        todo={mockTodo}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Test todo item")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /toggle completion for test todo item/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit test todo item/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete test todo item/i })).toBeInTheDocument();
  });

  it("calls onToggle when checkbox is clicked", async () => {
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

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith(mockTodo.id, true);
  });

  it("enters edit mode on edit button click and saves on Enter", async () => {
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

    const editBtn = screen.getByRole("button", { name: /edit test todo item/i });
    await user.click(editBtn);

    const editInput = screen.getByRole("textbox", { name: /edit todo title/i });
    expect(editInput).toHaveValue("Test todo item");

    await user.clear(editInput);
    await user.type(editInput, "Updated title{Enter}");

    expect(onEdit).toHaveBeenCalledWith(mockTodo.id, "Updated title");
  });

  it("cancels edit mode on Escape and restores original title", async () => {
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

    const editBtn = screen.getByRole("button", { name: /edit test todo item/i });
    await user.click(editBtn);

    const editInput = screen.getByRole("textbox", { name: /edit todo title/i });
    await user.clear(editInput);
    await user.type(editInput, "Abandoned changes{Escape}");

    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByText("Test todo item")).toBeInTheDocument();
  });

  it("shows an error alert and does not save when submitting empty title in edit mode", async () => {
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

    const editBtn = screen.getByRole("button", { name: /edit test todo item/i });
    await user.click(editBtn);

    const editInput = screen.getByRole("textbox", { name: /edit todo title/i });
    await user.clear(editInput);
    await user.type(editInput, "   {Enter}");

    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/title is required/i);
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

    const deleteBtn = screen.getByRole("button", { name: /delete test todo item/i });
    await user.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith(mockTodo.id);
  });
});
