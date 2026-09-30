"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Todo, CreateTodoInput, TodoPatchInput, Priority } from "@/lib/schemas";
import { TASK_CATEGORIES } from "@/lib/schemas";
import type { TodoFilter, SortOption } from "@/services";
import { todoService, subscribeStorageNotice } from "@/services";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [storageNotice, setStorageNotice] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setError(null);
      const data = await todoService.list();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load todos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    todoService
      .list()
      .then((data) => {
        if (!ignore) {
          setTodos(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load todos");
          setLoading(false);
        }
      });

    const unsubscribe = subscribeStorageNotice((notice) => {
      if (!ignore) {
        setStorageNotice(notice);
      }
    });

    return () => {
      ignore = true;
      unsubscribe();
    };
  }, []);

  const addTodo = useCallback(
    async (data: string | CreateTodoInput): Promise<Todo | undefined> => {
      try {
        setError(null);
        const payload = typeof data === "string" ? { title: data } : data;
        const created = await todoService.create(payload);
        setTodos((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add todo");
        throw err;
      }
    },
    []
  );

  const toggleTodo = useCallback(async (id: string, completed: boolean): Promise<Todo | undefined> => {
    try {
      setError(null);
      const updated = await todoService.update(id, { completed });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo");
      throw err;
    }
  }, []);

  const editTodo = useCallback(
    async (
      id: string,
      patch: string | TodoPatchInput
    ): Promise<Todo | undefined> => {
      try {
        setError(null);
        const payload: TodoPatchInput =
          typeof patch === "string" ? { title: patch } : patch;
        const updated = await todoService.update(id, payload);
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update todo");
        throw err;
      }
    },
    []
  );

  const deleteTodo = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await todoService.remove(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
      throw err;
    }
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(TASK_CATEGORIES);
    for (const t of todos) {
      if (t.category && t.category.trim()) {
        set.add(t.category.trim());
      }
    }
    return Array.from(set).sort();
  }, [todos]);

  const filteredTodos = useMemo(() => {
    let result = todos;

    // Filter by completion status
    if (filter === "active") {
      result = result.filter((t) => !t.completed);
    } else if (filter === "completed") {
      result = result.filter((t) => t.completed);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      result = result.filter((t) => (t.priority || "medium") === priorityFilter);
    }

    // Filter by category
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description ? t.description.toLowerCase().includes(query) : false)
      );
    }

    // Sort
    const priorityWeights: Record<Priority, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    return [...result].sort((a, b) => {
      if (sortBy === "dueDate") {
        if (a.dueDate && b.dueDate) {
          const cmp = a.dueDate.localeCompare(b.dueDate);
          if (cmp !== 0) return cmp;
          if (a.startTime && b.startTime) {
            const timeCmp = a.startTime.localeCompare(b.startTime);
            if (timeCmp !== 0) return timeCmp;
          } else if (a.startTime && !b.startTime) {
            return -1;
          } else if (!a.startTime && b.startTime) {
            return 1;
          }
        } else if (a.dueDate && !b.dueDate) {
          return -1;
        } else if (!a.dueDate && b.dueDate) {
          return 1;
        }
      } else if (sortBy === "priority") {
        const weightA = priorityWeights[a.priority || "medium"] ?? 2;
        const weightB = priorityWeights[b.priority || "medium"] ?? 2;
        if (weightA !== weightB) {
          return weightB - weightA;
        }
      }
      // Default / fallback to newest (createdAt descending)
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [todos, filter, priorityFilter, categoryFilter, searchTerm, sortBy]);

  const activeCount = useMemo(() => {
    return todos.filter((t) => !t.completed).length;
  }, [todos]);

  return {
    todos: filteredTodos,
    allTodos: todos,
    filter,
    setFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    categories,
    activeCount,
    loading,
    error,
    storageNotice,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    refresh: fetchTodos,
  };
}
