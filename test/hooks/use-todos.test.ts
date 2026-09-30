import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTodos } from "@/hooks/use-todos";
import { todoService } from "@/services";

describe("useTodos", () => {
  beforeEach(async () => {
    const existing = await todoService.list();
    for (const item of existing) {
      await todoService.remove(item.id);
    }
    vi.restoreAllMocks();
  });

  it("loads todos on mount", async () => {
    await todoService.create({ title: "Pre-existing todo" });

    const { result } = renderHook(() => useTodos());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe("Pre-existing todo");
  });

  it("adds a todo and prepends it to the list", async () => {
    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addTodo("New task");
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe("New task");
  });

  it("filters todos by priority and category", async () => {
    await todoService.create({ title: "Work urgent", priority: "high", category: "Work" });
    await todoService.create({ title: "Personal low", priority: "low", category: "Personal" });
    await todoService.create({ title: "Work medium", priority: "medium", category: "Work" });

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.todos).toHaveLength(3);
    expect(result.current.categories).toEqual(expect.arrayContaining(["Work", "Personal"]));

    // Filter by priority high
    act(() => {
      result.current.setPriorityFilter("high");
    });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe("Work urgent");

    // Reset priority, filter by category Work
    act(() => {
      result.current.setPriorityFilter("all");
      result.current.setCategoryFilter("Work");
    });
    expect(result.current.todos).toHaveLength(2);

    // Filter by both category Work and priority high
    act(() => {
      result.current.setPriorityFilter("high");
    });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe("Work urgent");
  });

  it("sorts todos by dueDate and priority", async () => {
    await todoService.create({ title: "Later due", dueDate: "2026-12-01", priority: "low" });
    await todoService.create({ title: "Earlier due", dueDate: "2026-10-01", priority: "medium" });
    await todoService.create({ title: "Top urgent", priority: "high" });

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Sort by dueDate: Earlier due first, then Later due, then items without dueDate
    act(() => {
      result.current.setSortBy("dueDate");
    });
    expect(result.current.todos[0].title).toBe("Earlier due");
    expect(result.current.todos[1].title).toBe("Later due");

    // Sort by priority: high -> medium -> low
    act(() => {
      result.current.setSortBy("priority");
    });
    expect(result.current.todos[0].title).toBe("Top urgent");
    expect(result.current.todos[1].title).toBe("Earlier due");
    expect(result.current.todos[2].title).toBe("Later due");
  });

  it("orders same-day todos chronologically by startTime when sortBy is dueDate", async () => {
    await todoService.create({
      title: "Afternoon review",
      dueDate: "2026-09-30",
      startTime: "15:00",
      endTime: "16:00",
    });
    await todoService.create({
      title: "Unscheduled today",
      dueDate: "2026-09-30",
    });
    await todoService.create({
      title: "Morning planning",
      dueDate: "2026-09-30",
      startTime: "08:30",
      endTime: "09:00",
    });

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSortBy("dueDate");
    });

    expect(result.current.todos.map((t) => t.title)).toEqual([
      "Morning planning",
      "Afternoon review",
      "Unscheduled today",
    ]);
  });

  describe("error handling and resilience", () => {
    it("surfaces error message and clears loading when initial fetch fails", async () => {
      vi.spyOn(todoService, "list").mockRejectedValueOnce(new Error("Network connection lost"));

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Network connection lost");
      expect(result.current.todos).toEqual([]);
    });

    it("surfaces error when addTodo fails", async () => {
      const { result } = renderHook(() => useTodos());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.spyOn(todoService, "create").mockRejectedValueOnce(new Error("500 Server Error"));

      await act(async () => {
        try {
          await result.current.addTodo("Failed Task");
        } catch {
          // expected rejection
        }
      });

      expect(result.current.error).toBe("500 Server Error");
    });

    it("surfaces error when toggleTodo fails", async () => {
      const created = await todoService.create({ title: "Toggle Test" });
      const { result } = renderHook(() => useTodos());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.spyOn(todoService, "update").mockRejectedValueOnce(new Error("Update failed"));

      await act(async () => {
        try {
          await result.current.toggleTodo(created.id, true);
        } catch {
          // expected rejection
        }
      });

      expect(result.current.error).toBe("Update failed");
    });

    it("surfaces error when editTodo fails", async () => {
      const created = await todoService.create({ title: "Edit Test" });
      const { result } = renderHook(() => useTodos());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.spyOn(todoService, "update").mockRejectedValueOnce(new Error("Edit failed"));

      await act(async () => {
        try {
          await result.current.editTodo(created.id, { title: "New Title" });
        } catch {
          // expected rejection
        }
      });

      expect(result.current.error).toBe("Edit failed");
    });

    it("surfaces error when deleteTodo fails", async () => {
      const created = await todoService.create({ title: "Delete Test" });
      const { result } = renderHook(() => useTodos());
      await waitFor(() => expect(result.current.loading).toBe(false));

      vi.spyOn(todoService, "remove").mockRejectedValueOnce(new Error("Delete failed"));

      await act(async () => {
        try {
          await result.current.deleteTodo(created.id);
        } catch {
          // expected rejection
        }
      });

      expect(result.current.error).toBe("Delete failed");
    });
  });
});
