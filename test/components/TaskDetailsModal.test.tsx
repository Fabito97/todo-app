import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TaskDetailsModal } from "@/components/TaskDetailsModal";
import { Todo } from "@/lib/schemas";

const sampleTodo: Todo = {
  id: "a0000000-0000-0000-0000-000000000001",
  title: "Q4 Keynote Preparation",
  completed: false,
  priority: "high",
  category: "Executive",
  dueDate: "2026-10-20",
  startTime: "14:00",
  endTime: "15:30",
  description: "Prepare slides for annual meeting",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("TaskDetailsModal component", () => {
  it("renders task metadata, time block, notes, and priority", () => {
    render(
      <TaskDetailsModal
        isOpen={true}
        todo={sampleTodo}
        onClose={vi.fn()}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog", { name: /task details/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Q4 Keynote Preparation")).toBeInTheDocument();
    expect(screen.getByText("Prepare slides for annual meeting")).toBeInTheDocument();
    expect(screen.getByText("14:00 – 15:30")).toBeInTheDocument();
    expect(screen.getByText("2026-10-20")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("allows toggling task completion", async () => {
    const handleToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskDetailsModal
        isOpen={true}
        todo={sampleTodo}
        onClose={vi.fn()}
        onToggle={handleToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const toggleBtn = screen.getByRole("button", { name: /mark as completed/i });
    await user.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledWith(sampleTodo.id, true);
  });

  it("handles inline delete confirmation", async () => {
    const handleDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskDetailsModal
        isOpen={true}
        todo={sampleTodo}
        onClose={vi.fn()}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={handleDelete}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /^delete task/i });
    await user.click(deleteBtn);

    expect(screen.getByText(/delete this task\?/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: /confirm delete/i });
    await user.click(confirmBtn);

    expect(handleDelete).toHaveBeenCalledWith(sampleTodo.id);
  });

  it("triggers onEdit and closes on Escape", async () => {
    const handleEdit = vi.fn();
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskDetailsModal
        isOpen={true}
        todo={sampleTodo}
        onClose={handleClose}
        onToggle={vi.fn()}
        onEdit={handleEdit}
        onDelete={vi.fn()}
      />
    );

    const editBtn = screen.getByRole("button", { name: /edit task/i });
    await user.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(sampleTodo);

    await user.keyboard("{Escape}");
    expect(handleClose).toHaveBeenCalled();
  });
});
