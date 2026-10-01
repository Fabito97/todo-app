import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Home from "@/app/page";
import { todoService } from "@/services";

describe("Home page workspace layout and resilience", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    window.history.replaceState({}, "", "/");
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

    // In Dashboard view, Today's tasks shows empty state
    expect(screen.getByText(/no tasks due today/i)).toBeInTheDocument();
  });

  it("continues to work in memory and shows visible notice when localStorage.setItem throws", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /open new task modal/i })).toBeInTheDocument();
    });

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const user = userEvent.setup();
    const input = screen.getByRole("textbox", { name: /quick add task title|todo title/i });
    const button = screen.getByRole("button", { name: /quick add task|add todo/i });

    await user.type(input, "In-memory Task");
    await user.click(button);

    // Visible notice appears
    expect(screen.getByText(/changes will only persist in memory/i)).toBeInTheDocument();

    // Switch to tasks view to see the created task
    const tasksBtn = screen.getAllByRole("button", { name: /^tasks/i })[0];
    await user.click(tasksBtn);

    // List updates in memory
    expect(screen.getByText("In-memory Task")).toBeInTheDocument();
  });

  it("renders full-viewport workspace container with Warm Graphite dark surfaces", () => {
    render(<Home />);

    const rootContainer = document.querySelector(".h-screen.overflow-hidden");
    expect(rootContainer).toBeInTheDocument();
    expect(rootContainer?.className).toContain("dark:bg-[#121316]");
  });

  it("renders desktop sidebar navigation and mobile bottom navigation with active view switching", async () => {
    const user = userEvent.setup();
    render(<Home />);

    // Sidebar navigation exists
    const sidebarNav = screen.getByRole("navigation", { name: /main navigation/i });
    expect(sidebarNav).toBeInTheDocument();

    // Mobile navigation exists
    const mobileNav = screen.getByRole("navigation", { name: /mobile navigation/i });
    expect(mobileNav).toBeInTheDocument();

    // Default view is Dashboard
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dashboard");

    // Click Tasks in sidebar navigation
    const tasksButtons = screen.getAllByRole("button", { name: /^tasks/i });
    await user.click(tasksButtons[0]);

    // View switches to Tasks
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tasks");
    expect(screen.getByRole("region", { name: /task list board/i })).toBeInTheDocument();

    // Click Calendar in sidebar navigation
    const calendarButtons = screen.getAllByRole("button", { name: /^calendar/i });
    await user.click(calendarButtons[0]);

    // View switches to Calendar
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Calendar");
    expect(screen.getByRole("region", { name: /monthly calendar/i })).toBeInTheDocument();
  });

  it("renders 'New Task' primary action button in the content header", () => {
    render(<Home />);

    const newBtn = screen.getByRole("button", { name: /open new task modal/i });
    expect(newBtn).toBeInTheDocument();
    expect(newBtn).toHaveTextContent(/New Task/i);
  });

  it("switches theme between light and dark via ThemeToggle", async () => {
    document.documentElement.classList.remove("dark");
    const user = userEvent.setup();
    render(<Home />);

    const darkBtns = screen.getAllByRole("button", { name: /dark theme/i });
    await user.click(darkBtns[0]);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme:v1")).toBe("dark");
  });

  it("surfaces an accessible error toast notice when service returns an error", async () => {
    vi.spyOn(todoService, "list").mockRejectedValueOnce(new Error("Unable to connect to server"));

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Unable to connect to server")).toBeInTheDocument();
    });

    const statusElements = screen.getAllByRole("status");
    expect(statusElements.some((el) => el.textContent?.includes("Unable to connect to server"))).toBe(true);
  });

  it("restores active view from ?tab URL search parameter on reload", async () => {
    window.history.replaceState({}, "", "/?tab=calendar");

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Calendar");
    });
    expect(screen.getByRole("region", { name: /monthly calendar/i })).toBeInTheDocument();
  });

  it("updates URL query parameter when switching tabs and clears it for dashboard", async () => {
    window.history.replaceState({}, "", "/");
    const user = userEvent.setup();

    render(<Home />);

    // Switch to tasks
    const tasksBtn = screen.getAllByRole("button", { name: /^tasks/i })[0];
    await user.click(tasksBtn);

    expect(window.location.search).toBe("?tab=tasks");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tasks");

    // Switch back to dashboard
    const dashboardBtn = screen.getAllByRole("button", { name: /^dashboard/i })[0];
    await user.click(dashboardBtn);

    expect(window.location.search).toBe("");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dashboard");
  });
});
