"use client";

import React from "react";
import type { Todo, TodoPatchInput } from "@/lib/schemas";
import type { TodoFilter } from "@/services";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  filter?: TodoFilter;
  hasActiveFilters?: boolean;
  onToggle?: (id: string, completed: boolean) => void;
  onEdit?: (id: string, patch: TodoPatchInput | string) => Promise<unknown> | void;
  onOpenEdit?: (todo: Todo) => void;
  onOpenDetails?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
}

export function TodoList({
  todos,
  loading,
  filter = "all",
  hasActiveFilters = false,
  onToggle = () => {},
  onEdit = () => {},
  onOpenEdit,
  onOpenDetails,
  onDelete = () => {},
}: TodoListProps) {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-400">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-3" />
        <p className="text-sm font-medium">Loading todos...</p>
      </div>
    );
  }

  if (todos.length === 0) {
    const emptyMessages: Record<TodoFilter, { title: string; subtitle: string }> = {
      all: {
        title: "No todos yet",
        subtitle: "Add your first task above to get started",
      },
      active: {
        title: "No active todos",
        subtitle: "All tasks are completed!",
      },
      completed: {
        title: "No completed todos",
        subtitle: "Complete a task to see it here",
      },
    };

    const currentMsg = hasActiveFilters
      ? {
          title: "No matching todos",
          subtitle: "Try adjusting your filters to see more tasks",
        }
      : emptyMessages[filter] || emptyMessages.all;

    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500 dark:text-zinc-300 border border-dashed border-slate-200 dark:border-[#2e3340] bg-slate-50/40 dark:bg-[#22262f]/50 rounded-2xl">
        <p className="text-sm font-medium">{currentMsg.title}</p>
        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1">
          {currentMsg.subtitle}
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
          onOpenEdit={onOpenEdit}
          onOpenDetails={onOpenDetails}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
