import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Home from "@/app/page";
import { todoService } from "@/services";

describe("Home page resilience", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    const existing = await todoService.list();
    for (const item of existing) {
      await todoService.remove(item.id);
    }
    localStorage.clear();
  });

  it("shows empty list and a visible notice when stored data is corrupt", async () => {
    localStorage.setItem("todos:v1", "CORRUPT_JSON_DATA{{{");

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        /stored data was corrupt or invalid/i
      );
    });

    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it("continues to work in memory and shows visible notice when localStorage.setItem throws", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /todo title/i })).toBeInTheDocument();
    });

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const user = userEvent.setup();
    const input = screen.getByRole("textbox", { name: /todo title/i });
    const button = screen.getByRole("button", { name: /add todo/i });

    await user.type(input, "In-memory Task");
    await user.click(button);

    // List updates in memory
    expect(screen.getByText("In-memory Task")).toBeInTheDocument();

    // Visible notice appears
    expect(screen.getByRole("status")).toHaveTextContent(
      /changes will only persist in memory/i
    );
  });

  it("renders theme switcher in header, applies Warm Graphite dark surfaces, and switches to dark mode on click", async () => {
    document.documentElement.classList.remove("dark");
    const user = userEvent.setup();
    render(<Home />);

    const mainEl = screen.getByRole("main");
    expect(mainEl.className).toContain("dark:bg-[#121316]");
    expect(mainEl.className).not.toContain("transition-colors");

    const summarySection = screen.getByRole("region", { name: /task progress summary/i });
    expect(summarySection.className).toContain("dark:bg-[#1a1d24]");

    const darkBtn = screen.getByRole("button", { name: /dark theme/i });
    await user.click(darkBtn);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme:v1")).toBe("dark");
  });

  it("displays Total, Active, and Completed stats and updates completion progress bar", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    });

    const input = screen.getByRole("textbox", { name: /todo title/i });
    const addBtn = screen.getByRole("button", { name: /add todo/i });

    await user.type(input, "Task One");
    await user.click(addBtn);
    await user.type(input, "Task Two");
    await user.click(addBtn);

    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");

    const checkboxOne = screen.getByRole("checkbox", {
      name: /toggle completion for task one/i,
    });
    await user.click(checkboxOne);

    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    });

    const checkboxTwo = screen.getByRole("checkbox", {
      name: /toggle completion for task two/i,
    });
    await user.click(checkboxTwo);

    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    });
  });
});


