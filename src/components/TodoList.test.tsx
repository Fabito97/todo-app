import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TodoList } from "./TodoList";
import type { Todo } from "@/lib/schemas";

const sampleTodos: Todo[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "First task",
    completed: false,
    createdAt: "2026-09-29T10:00:00.000Z",
    updatedAt: "2026-09-29T10:00:00.000Z",
    description: "",
    priority: "medium",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "Second task",
    completed: true,
    createdAt: "2026-09-29T09:00:00.000Z",
    updatedAt: "2026-09-29T09:00:00.000Z",
    description: "",
    priority: "high",
  },
];

describe("TodoList", () => {
  it("renders loading state when loading is true", () => {
    render(<TodoList todos={[]} loading={true} />);
    expect(screen.getByText(/loading todos/i)).toBeInTheDocument();
  });

  it("renders contextual empty messages for each filter when todos is empty and not loading", () => {
    const { rerender } = render(<TodoList todos={[]} loading={false} filter="all" />);
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();

    rerender(<TodoList todos={[]} loading={false} filter="active" />);
    expect(screen.getByText(/no active todos/i)).toBeInTheDocument();

    rerender(<TodoList todos={[]} loading={false} filter="completed" />);
    expect(screen.getByText(/no completed todos/i)).toBeInTheDocument();
  });

  it("renders list items when todos are provided", () => {
    render(<TodoList todos={sampleTodos} loading={false} />);
    expect(screen.getByText("First task")).toBeInTheDocument();
    expect(screen.getByText("Second task")).toBeInTheDocument();
  });

  it("renders contextual empty message when active filters return no results", () => {
    render(<TodoList todos={[]} loading={false} hasActiveFilters={true} />);
    expect(screen.getByText(/no matching todos/i)).toBeInTheDocument();
  });
});
