"use client";

import React from "react";
import { Todo, Priority } from "@/lib/schemas";
import { TodoFilter, SortOption } from "@/services";
import { FilterBar } from "./FilterBar";
import { TodoList } from "./TodoList";

interface TasksViewProps {
  todos: Todo[];
  totalCount: number;
  activeCount: number;
  loading?: boolean;
  error?: string | null;
  filter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  priorityFilter: Priority | "all";
  onPriorityFilterChange: (priority: Priority | "all") => void;
  categoryFilter: string | "all";
  onCategoryFilterChange: (category: string | "all") => void;
  categories: string[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onToggle: (id: string, completed: boolean) => void;
  onOpenEdit: (todo: Todo) => void;
  onOpenDetails: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onOpenNewTask: () => void;
}

export function TasksView({
  todos,
  totalCount,
  activeCount,
  loading = false,
  error = null,
  filter,
  onFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  sortBy,
  onSortChange,
  onToggle,
  onOpenEdit,
  onOpenDetails,
  onDelete,
  onOpenNewTask,
}: TasksViewProps) {
  const hasActiveFilters =
    priorityFilter !== "all" || categoryFilter !== "all";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Board Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
            Tasks
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {totalCount} {totalCount === 1 ? "task" : "tasks"} total ({activeCount} active)
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewTask}
          aria-label="Open new task modal from tasks view"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
        >
          <svg
            aria-hidden="true"
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>New Task</span>
        </button>
      </div>

      {/* Main Task List Card */}
      <section
        aria-label="Task list board"
        className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-6 shadow-md space-y-6"
      >
        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300"
          >
            {error}
          </div>
        )}

        <div>
          <TodoList
            todos={todos}
            loading={loading}
            filter={filter}
            hasActiveFilters={hasActiveFilters}
            onToggle={onToggle}
            onOpenEdit={onOpenEdit}
            onOpenDetails={onOpenDetails}
            onDelete={onDelete}
          />
        </div>

        {!loading && (
          <section aria-label="Task filters and sorting">
            <FilterBar
              activeCount={activeCount}
              currentFilter={filter}
              onFilterChange={onFilterChange}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={onPriorityFilterChange}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={onCategoryFilterChange}
              categories={categories}
              sortBy={sortBy}
              onSortChange={onSortChange}
            />
          </section>
        )}
      </section>
    </div>
  );
}
