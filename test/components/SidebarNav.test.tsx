import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SidebarNav } from "@/components/SidebarNav";

describe("SidebarNav component", () => {
  it("renders the workspace brand name and 3 navigation items", () => {
    render(<SidebarNav activeView="dashboard" onSelectView={vi.fn()} />);

    expect(screen.getByText("Task Workspace")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^tasks/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^calendar/i })).toBeInTheDocument();
  });

  it("applies aria-current='page' to the active navigation item", () => {
    const { rerender } = render(
      <SidebarNav activeView="dashboard" onSelectView={vi.fn()} />
    );

    const dashboardBtn = screen.getByRole("button", { name: /^dashboard/i });
    const tasksBtn = screen.getByRole("button", { name: /^tasks/i });
    const calendarBtn = screen.getByRole("button", { name: /^calendar/i });

    expect(dashboardBtn).toHaveAttribute("aria-current", "page");
    expect(tasksBtn).not.toHaveAttribute("aria-current");
    expect(calendarBtn).not.toHaveAttribute("aria-current");

    rerender(<SidebarNav activeView="tasks" onSelectView={vi.fn()} />);
    expect(dashboardBtn).not.toHaveAttribute("aria-current");
    expect(tasksBtn).toHaveAttribute("aria-current", "page");

    rerender(<SidebarNav activeView="calendar" onSelectView={vi.fn()} />);
    expect(tasksBtn).not.toHaveAttribute("aria-current");
    expect(calendarBtn).toHaveAttribute("aria-current", "page");
  });

  it("triggers onSelectView callback with the selected view when clicked", async () => {
    const handleSelectView = vi.fn();
    const user = userEvent.setup();

    render(<SidebarNav activeView="dashboard" onSelectView={handleSelectView} />);

    await user.click(screen.getByRole("button", { name: /^tasks/i }));
    expect(handleSelectView).toHaveBeenCalledWith("tasks");

    await user.click(screen.getByRole("button", { name: /^calendar/i }));
    expect(handleSelectView).toHaveBeenCalledWith("calendar");
  });

  it("renders the theme toggle at the bottom", () => {
    render(<SidebarNav activeView="dashboard" onSelectView={vi.fn()} />);

    expect(screen.getByRole("button", { name: /light theme/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dark theme/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /system theme/i })).toBeInTheDocument();
  });
});
