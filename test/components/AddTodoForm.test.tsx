import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AddTodoForm } from "@/components/AddTodoForm";

describe("AddTodoForm", () => {
  it("submits valid title alone with default priority 'medium' and clears input", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<AddTodoForm onAdd={onAdd} />);

    const input = screen.getByRole("textbox", { name: /todo title/i });
    const button = screen.getByRole("button", { name: /add todo/i });

    await user.type(input, "Buy groceries");
    await user.click(button);

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Buy groceries",
        priority: "medium",
      })
    );
    expect(input).toHaveValue("");
  });

  it("shows an inline error message and does not submit for empty or whitespace-only input", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<AddTodoForm onAdd={onAdd} />);

    const button = screen.getByRole("button", { name: /add todo/i });
    await user.click(button);

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/title is required/i);

    const input = screen.getByRole("textbox", { name: /todo title/i });
    await user.type(input, "   ");
    await user.click(button);

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/title is required/i);
  });

  it("shows an inline error message and does not submit for title longer than 200 chars", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<AddTodoForm onAdd={onAdd} />);

    const input = screen.getByRole("textbox", { name: /todo title/i });
    const button = screen.getByRole("button", { name: /add todo/i });

    const longTitle = "a".repeat(201);
    await user.click(input);
    await user.paste(longTitle);
    await user.click(button);

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/200 characters or fewer/i);
  });

  it("expands details panel and submits with description, priority, dueDate, and category", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<AddTodoForm onAdd={onAdd} />);

    const toggleDetails = screen.getByRole("button", { name: /toggle details/i });
    await user.click(toggleDetails);

    const titleInput = screen.getByRole("textbox", { name: /todo title/i });
    const descInput = screen.getByRole("textbox", { name: /description/i });
    const highPriority = screen.getByRole("button", { name: /priority high/i });
    const dueDateInput = screen.getByLabelText(/due date/i);
    const categoryInput = screen.getByRole("textbox", { name: /category/i });
    const submitBtn = screen.getByRole("button", { name: /add todo/i });

    await user.type(titleInput, "Launch project");
    await user.type(descInput, "Check all deployment logs before going live");
    await user.click(highPriority);
    await user.type(dueDateInput, "2026-10-31");
    await user.type(categoryInput, "Work");

    await user.click(submitBtn);

    expect(onAdd).toHaveBeenCalledWith({
      title: "Launch project",
      description: "Check all deployment logs before going live",
      priority: "high",
      dueDate: "2026-10-31",
      category: "Work",
    });

    expect(titleInput).toHaveValue("");
    expect(descInput).toHaveValue("");
    expect(dueDateInput).toHaveValue("");
    expect(categoryInput).toHaveValue("");
  });

  it("shows an inline error when description is longer than 1000 characters", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<AddTodoForm onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: /toggle details/i }));
    await user.type(screen.getByRole("textbox", { name: /todo title/i }), "Valid Title");

    const descInput = screen.getByRole("textbox", { name: /description/i });
    await user.click(descInput);
    await user.paste("a".repeat(1001));

    await user.click(screen.getByRole("button", { name: /add todo/i }));
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/1000 characters or fewer/i);
  });
});
