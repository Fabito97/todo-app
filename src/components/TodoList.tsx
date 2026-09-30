"use client";

import React from "react";
import { Search, Inbox } from "lucide-react";
import type { Todo, TodoPatchInput } from "@/lib/schemas";
import type { TodoFilter } from "@/services";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  loading: boolean;
  filter?: TodoFilter;
  hasActiveFilters?: boolean;
  searchTerm?: string;
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
  searchTerm = "",
  onToggle = () => {},
  onEdit = () => {},
  onOpenEdit,
  onOpenDetails,
  onDelete = () => {},
}: TodoListProps) {
  if (loading) {
    return (
      <div className="space-y-3" aria-label="Loading tasks">
        <div className="py-4 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-2" />
          <p className="text-sm font-medium">Loading todos...</p>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-[#2e3340]/80 border-l-4 border-l-slate-300 dark:border-l-zinc-700 bg-white/60 dark:bg-[#1a1d24]/60 animate-pulse flex flex-col gap-2.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-md bg-slate-200 dark:bg-zinc-800" />
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded-md w-1/3" />
            </div>
            <div className="flex items-center gap-2 pl-7 mt-1">
              <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded-full w-12" />
              <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded-full w-16" />
            </div>
          </div>
        ))}
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

    const isSearchEmpty = Boolean(searchTerm && searchTerm.trim().length > 0);

    const currentMsg = isSearchEmpty
      ? {
          title: `No tasks matching "${searchTerm}"`,
          subtitle: "Check your spelling or try clearing the search filter",
        }
      : hasActiveFilters
      ? {
          title: "No matching todos",
          subtitle: "Try adjusting your filters to see more tasks",
        }
      : emptyMessages[filter] || emptyMessages.all;

    return (
      <div className="py-12 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-[#2e3340] bg-slate-50/40 dark:bg-[#22262f]/40 rounded-2xl">
        <div className="p-3 rounded-full bg-slate-100 dark:bg-[#1a1d24] text-slate-400 dark:text-zinc-500 mb-3">
          {isSearchEmpty ? (
            <Search className="w-6 h-6" />
          ) : (
            <Inbox className="w-6 h-6" />
          )}
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
          {currentMsg.title}
        </p>
        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1 max-w-sm">
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
