import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AddTaskModal } from "@/components/AddTaskModal";

describe("AddTaskModal component", () => {
  it("renders accessible modal dialog with required fields", () => {
    render(
      <AddTaskModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog", { name: /new task/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");

    expect(screen.getByRole("textbox", { name: /task title/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /task description/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /task category/i })).toBeInTheDocument();
  });

  it("validates required title and shows inline error", async () => {
    const handleAdd = vi.fn();
    const user = userEvent.setup();

    render(
      <AddTaskModal
        isOpen={true}
        onClose={vi.fn()}
        onAdd={handleAdd}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /create task/i });
    await user.click(submitBtn);

    expect(handleAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/title is required/i);
  });

  it("submits full metadata when valid and triggers onAdd", async () => {
    const handleAdd = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AddTaskModal
        isOpen={true}
        onClose={handleClose}
        onAdd={handleAdd}
      />
    );

    await user.type(screen.getByRole("textbox", { name: /task title/i }), "Strategic Planning");
    await user.type(screen.getByRole("textbox", { name: /task description/i }), "Q4 execution");
    await user.type(screen.getByLabelText(/due date/i), "2026-10-15");
    await user.type(screen.getByLabelText(/start time/i), "09:00");
    await user.type(screen.getByLabelText(/end time/i), "11:00");
    await user.click(screen.getByRole("radio", { name: /high priority/i }));

    const submitBtn = screen.getByRole("button", { name: /create task/i });
    await user.click(submitBtn);

    expect(handleAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Strategic Planning",
        description: "Q4 execution",
        dueDate: "2026-10-15",
        startTime: "09:00",
        endTime: "11:00",
        priority: "high",
      })
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it("closes when Cancel button is clicked or Escape is pressed", async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AddTaskModal
        isOpen={true}
        onClose={handleClose}
        onAdd={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledOnce();

    await user.keyboard("{Escape}");
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
