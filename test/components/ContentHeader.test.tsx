import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ContentHeader } from "@/components/ContentHeader";
import { Todo } from "@/lib/schemas";

const sampleTodos: Todo[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    title: "Test Task",
    completed: false,
    priority: "high",
    category: "",
    dueDate: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "10:00",
    description: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("ContentHeader component", () => {
  it("renders appropriate title and subtitle for dashboard view", () => {
    render(
      <ContentHeader
        activeView="dashboard"
        onOpenNewTask={vi.fn()}
        todos={sampleTodos}
      />
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dashboard");
    expect(screen.getByText("Your executive task overview")).toBeInTheDocument();
  });

  it("renders appropriate title and subtitle for tasks view", () => {
    render(
      <ContentHeader
        activeView="tasks"
        onOpenNewTask={vi.fn()}
        todos={sampleTodos}
      />
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Tasks");
    expect(screen.getByText("Manage and filter all your tasks")).toBeInTheDocument();
  });

  it("renders appropriate title and subtitle for calendar view", () => {
    render(
      <ContentHeader
        activeView="calendar"
        onOpenNewTask={vi.fn()}
        todos={sampleTodos}
      />
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Calendar");
    expect(screen.getByText("Browse by month and plan your schedule")).toBeInTheDocument();
  });

  it("renders '+ New Task' primary CTA button and triggers onOpenNewTask on click", async () => {
    const handleOpenNewTask = vi.fn();
    const user = userEvent.setup();

    render(
      <ContentHeader
        activeView="dashboard"
        onOpenNewTask={handleOpenNewTask}
        todos={sampleTodos}
      />
    );

    const newBtn = screen.getByRole("button", { name: /open new task modal/i });
    expect(newBtn).toBeInTheDocument();
    expect(newBtn).toHaveTextContent(/New Task/i);

    await user.click(newBtn);
    expect(handleOpenNewTask).toHaveBeenCalledOnce();
  });

  it("renders the Notification Center trigger with badge count", () => {
    render(
      <ContentHeader
        activeView="dashboard"
        onOpenNewTask={vi.fn()}
        todos={sampleTodos}
      />
    );

    const notifBtn = screen.getByRole("button", { name: /notifications/i });
    expect(notifBtn).toBeInTheDocument();
    expect(notifBtn).toHaveTextContent("1");
  });

  it("renders mobile top bar with app title, compact + button, and hamburger menu trigger", async () => {
    const handleOpenSidebar = vi.fn();
    const handleOpenNewTask = vi.fn();
    const user = userEvent.setup();

    render(
      <ContentHeader
        activeView="dashboard"
        onOpenNewTask={handleOpenNewTask}
        onOpenSidebar={handleOpenSidebar}
        todos={sampleTodos}
      />
    );

    // App title is present
    expect(screen.getByText(/^(Tasks|Todo)$/i)).toBeInTheDocument();

    // Compact + button triggers onOpenNewTask
    const compactBtn = screen.getByRole("button", { name: /^new task$/i });
    expect(compactBtn).toBeInTheDocument();
    await user.click(compactBtn);
    expect(handleOpenNewTask).toHaveBeenCalledOnce();

    // Hamburger button triggers onOpenSidebar
    const hamburgerBtn = screen.getByRole("button", { name: /open navigation menu/i });
    expect(hamburgerBtn).toBeInTheDocument();
    await user.click(hamburgerBtn);
    expect(handleOpenSidebar).toHaveBeenCalledOnce();
  });
});
