"use client";

import React from "react";
import type { Todo } from "@/lib/schemas";

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
}

export function TodoList({ todos, loading }: TodoListProps) {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-3" />
        <p className="text-sm font-medium">Loading todos...</p>
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <p className="text-sm font-medium">No todos yet</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
          Add your first task above to get started
        </p>
      </div>
    );
  }

  return (
    <ul role="list" className="space-y-2">
      {todos.map((todo) => (
        <li
          key={todo.id}
          role="listitem"
          className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs"
        >
          <span
            className={`text-sm select-none ${
              todo.completed
                ? "line-through text-zinc-400 dark:text-zinc-600"
                : "text-zinc-800 dark:text-zinc-200 font-medium"
            }`}
          >
            {todo.title}
          </span>
        </li>
      ))}
    </ul>
  );
}
