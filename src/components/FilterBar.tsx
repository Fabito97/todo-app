"use client";

import React from "react";
import type { TodoFilter, SortOption } from "@/services";
import type { Priority } from "@/lib/schemas";

interface FilterBarProps {
  activeCount: number;
  currentFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  priorityFilter?: Priority | "all";
  onPriorityFilterChange?: (priority: Priority | "all") => void;
  categoryFilter?: string | "all";
  onCategoryFilterChange?: (category: string | "all") => void;
  categories?: string[];
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

const STATUS_FILTERS: { label: string; value: TodoFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

const PRIORITY_OPTIONS: { label: string; value: Priority | "all"; ariaLabel: string }[] = [
  { label: "All", value: "all", ariaLabel: "Priority all" },
  { label: "High", value: "high", ariaLabel: "Priority high" },
  { label: "Med", value: "medium", ariaLabel: "Priority medium" },
  { label: "Low", value: "low", ariaLabel: "Priority low" },
];

export function FilterBar({
  activeCount,
  currentFilter,
  onFilterChange,
  priorityFilter = "all",
  onPriorityFilterChange = () => {},
  categoryFilter = "all",
  onCategoryFilterChange = () => {},
  categories = [],
  sortBy = "newest",
  onSortChange = () => {},
}: FilterBarProps) {
  const hasActiveFilters =
    currentFilter !== "all" ||
    priorityFilter !== "all" ||
    categoryFilter !== "all";

  const handleResetFilters = () => {
    onFilterChange("all");
    onPriorityFilterChange("all");
    onCategoryFilterChange("all");
  };

  return (
    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-300">
      {/* Top Row: Counter & Status Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {activeCount} {activeCount === 1 ? "item" : "items"} left
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              aria-label="Reset filters"
              className="px-2 py-0.5 rounded-md text-[11px] font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 dark:bg-slate-900/60 backdrop-blur-xs">
          {STATUS_FILTERS.map(({ label, value }) => {
            const isSelected = currentFilter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onFilterChange(value)}
                aria-current={isSelected ? "page" : undefined}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Second Row: Priority Chips, Category Filter, and Sort Order */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-[11px]">
        {/* Priority Filter Chips */}
        <div className="flex items-center gap-1" role="group" aria-label="Filter by priority">
          <span className="text-[10px] text-slate-400 dark:text-slate-400 mr-1 hidden sm:inline">Priority:</span>
          {PRIORITY_OPTIONS.map(({ label, value, ariaLabel }) => {
            const isPressed = priorityFilter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onPriorityFilterChange(value)}
                aria-label={ariaLabel}
                aria-pressed={isPressed}
                className={`px-2 py-0.5 rounded-md font-medium border transition-colors cursor-pointer ${
                  isPressed
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/80 dark:border-indigo-700 dark:text-indigo-300"
                    : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Category and Sort Selectors */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            aria-label="Filter by category"
            className="rounded-lg border border-slate-200 dark:border-slate-600/80 bg-white dark:bg-slate-700/70 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort todos by"
            className="rounded-lg border border-slate-200 dark:border-slate-600/80 bg-white dark:bg-slate-700/70 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="newest">Newest</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
}
