"use client";

import React from "react";
import type { Todo } from "@/lib/schemas";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  onToggle?: (id: string, completed: boolean) => void;
  onEdit?: (id: string, title: string) => Promise<unknown> | void;
  onDelete?: (id: string) => void;
}

export function TodoList({
  todos,
  loading,
  onToggle = () => {},
  onEdit = () => {},
  onDelete = () => {},
}: TodoListProps) {
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
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
