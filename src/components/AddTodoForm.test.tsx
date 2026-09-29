import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AddTodoForm } from "./AddTodoForm";

describe("AddTodoForm", () => {
  it("submits valid title, calls onAdd, and clears input", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<AddTodoForm onAdd={onAdd} />);

    const input = screen.getByRole("textbox", { name: /todo title/i });
    const button = screen.getByRole("button", { name: /add todo/i });

    await user.type(input, "Buy groceries");
    await user.click(button);

    expect(onAdd).toHaveBeenCalledWith("Buy groceries");
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
    await user.type(input, longTitle);
    await user.click(button);

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/200 characters or fewer/i);
  });
});
