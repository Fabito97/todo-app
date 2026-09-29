"use client";

import { useState, useEffect, useCallback } from "react";
import type { Todo } from "@/lib/schemas";
import { todoService } from "@/services";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

    return () => {
      ignore = true;
    };
  }, []);

  const addTodo = useCallback(async (title: string): Promise<Todo | undefined> => {
    try {
      setError(null);
      const created = await todoService.create({ title });
      setTodos((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add todo");
      throw err;
    }
  }, []);

  return {
    todos,
    loading,
    error,
    addTodo,
    refresh: fetchTodos,
  };
}
