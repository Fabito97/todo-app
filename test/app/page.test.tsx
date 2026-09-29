import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Home from "@/app/page";

describe("Home page resilience", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
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

  it("renders theme switcher in header and switches to dark mode on click", async () => {
    document.documentElement.classList.remove("dark");
    const user = userEvent.setup();
    render(<Home />);

    const darkBtn = screen.getByRole("button", { name: /dark theme/i });
    await user.click(darkBtn);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme:v1")).toBe("dark");
  });
});

