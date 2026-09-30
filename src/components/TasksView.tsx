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
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onToggle: (id: string, completed: boolean) => void;
  onOpenEdit: (todo: Todo) => void;
  onOpenDetails: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onOpenNewTask?: () => void;
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
  searchTerm = "",
  onSearchChange = () => {},
  sortBy,
  onSortChange,
  onToggle,
  onOpenEdit,
  onOpenDetails,
  onDelete,
}: TasksViewProps) {
  const hasActiveFilters =
    priorityFilter !== "all" ||
    categoryFilter !== "all" ||
    Boolean(searchTerm && searchTerm.trim().length > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Error alert if any */}
      {error && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300"
        >
          {error}
        </div>
      )}

      {/* Controls & Filters Bar (placed at the top as in v1.4 mockup) */}
      <section aria-label="Task filters and sorting">
        <FilterBar
          totalCount={totalCount}
          activeCount={activeCount}
          completedCount={Math.max(0, totalCount - activeCount)}
          currentFilter={filter}
          onFilterChange={onFilterChange}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={onPriorityFilterChange}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={onCategoryFilterChange}
          categories={categories}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      </section>

      {/* Task List Items (rendered directly as individual cards in space-y-3) */}
      <section aria-label="Task list board" className="space-y-3">
        <TodoList
          todos={todos}
          loading={loading}
          filter={filter}
          hasActiveFilters={hasActiveFilters}
          searchTerm={searchTerm}
          onToggle={onToggle}
          onOpenEdit={onOpenEdit}
          onOpenDetails={onOpenDetails}
          onDelete={onDelete}
        />
      </section>
    </div>
  );
}
