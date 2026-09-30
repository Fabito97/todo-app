import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { EditTaskModal } from "@/components/EditTaskModal";
import { Todo } from "@/lib/schemas";

const sampleTodo: Todo = {
  id: "a0000000-0000-0000-0000-000000000001",
  title: "Existing Task Title",
  completed: false,
  priority: "medium",
  category: "Work",
  dueDate: "2026-10-25",
  startTime: "10:00",
  endTime: "11:00",
  description: "Existing Description",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("EditTaskModal component", () => {
  it("pre-populates existing values into form fields", () => {
    render(
      <EditTaskModal
        isOpen={true}
        todo={sampleTodo}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog", { name: /edit task/i });
    expect(dialog).toBeInTheDocument();

    expect(screen.getByRole("textbox", { name: /edit title/i })).toHaveValue("Existing Task Title");
    expect(screen.getByRole("textbox", { name: /edit description/i })).toHaveValue("Existing Description");
    expect(screen.getByLabelText(/edit due date/i)).toHaveValue("2026-10-25");
    expect(screen.getByLabelText(/edit start time/i)).toHaveValue("10:00");
    expect(screen.getByLabelText(/edit end time/i)).toHaveValue("11:00");
  });

  it("submits updated values on Save Changes", async () => {
    const handleSave = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <EditTaskModal
        isOpen={true}
        todo={sampleTodo}
        onClose={handleClose}
        onSave={handleSave}
      />
    );

    const titleInput = screen.getByRole("textbox", { name: /edit title/i });
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Task Title");

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await user.click(saveBtn);

    expect(handleSave).toHaveBeenCalledWith(
      sampleTodo.id,
      expect.objectContaining({
        title: "Updated Task Title",
      })
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it("validates time range and displays error alert when end time is before start time", async () => {
    const handleSave = vi.fn();
    const user = userEvent.setup();

    render(
      <EditTaskModal
        isOpen={true}
        todo={sampleTodo}
        onClose={vi.fn()}
        onSave={handleSave}
      />
    );

    const startInput = screen.getByLabelText(/edit start time/i);
    const endInput = screen.getByLabelText(/edit end time/i);

    await user.clear(startInput);
    await user.type(startInput, "15:00");
    await user.clear(endInput);
    await user.type(endInput, "14:00");

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await user.click(saveBtn);

    expect(handleSave).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/end time must be after start time/i);
  });
});
