import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTodos } from "./use-todos";
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
});
