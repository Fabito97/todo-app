"use client";

import React from "react";
import { Search } from "lucide-react";
import type { TodoFilter, SortOption } from "@/services";
import type { Priority } from "@/lib/schemas";

interface FilterBarProps {
  totalCount?: number;
  activeCount: number;
  completedCount?: number;
  currentFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
  priorityFilter?: Priority | "all";
  onPriorityFilterChange?: (priority: Priority | "all") => void;
  categoryFilter?: string | "all";
  onCategoryFilterChange?: (category: string | "all") => void;
  categories?: string[];
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

const STATUS_FILTERS: { label: string; value: TodoFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Done", value: "completed" },
];

const PRIORITY_OPTIONS: { label: string; value: Priority | "all"; ariaLabel: string }[] = [
  { label: "All", value: "all", ariaLabel: "Priority all" },
  { label: "High", value: "high", ariaLabel: "Priority high" },
  { label: "Med", value: "medium", ariaLabel: "Priority medium" },
  { label: "Low", value: "low", ariaLabel: "Priority low" },
];

export function FilterBar({
  totalCount,
  activeCount,
  completedCount,
  currentFilter,
  onFilterChange,
  priorityFilter = "all",
  onPriorityFilterChange = () => {},
  categoryFilter = "all",
  onCategoryFilterChange = () => {},
  categories = [],
  searchTerm = "",
  onSearchChange = () => {},
  sortBy = "newest",
  onSortChange = () => {},
}: FilterBarProps) {
  const hasActiveFilters =
    currentFilter !== "all" ||
    priorityFilter !== "all" ||
    categoryFilter !== "all" ||
    Boolean(searchTerm && searchTerm.trim().length > 0);

  const handleResetFilters = () => {
    onFilterChange("all");
    onPriorityFilterChange("all");
    onCategoryFilterChange("all");
    onSearchChange("");
  };

  const getStatusCount = (value: TodoFilter) => {
    if (value === "all") return totalCount;
    if (value === "active") return activeCount;
    if (value === "completed") return completedCount;
    return undefined;
  };

  return (
    <div className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Screen reader count for accessibility and test suites */}
      <span className="sr-only">
        {activeCount} {activeCount === 1 ? "item" : "items"} left
      </span>

      {/* Left: Filter Tabs, Priority & Category Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 mr-1">
          Status:
        </span>

        {/* Status Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#22262f] text-xs font-medium">
          {STATUS_FILTERS.map(({ label, value }) => {
            const isSelected = currentFilter === value;
            const count = getStatusCount(value);
            const ariaLabel =
              value === "completed"
                ? typeof count === "number"
                  ? `Completed (${count})`
                  : "Completed"
                : undefined;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onFilterChange(value)}
                aria-current={isSelected ? "page" : undefined}
                aria-label={ariaLabel}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white dark:bg-[#1a1d24] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {typeof count === "number" ? `${label} (${count})` : label}
              </button>
            );
          })}
        </div>

        {/* Priority Filter Segmented Tabs */}
        <div
          role="group"
          aria-label="Filter by priority"
          className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#22262f] text-xs font-medium"
        >
          {PRIORITY_OPTIONS.map(({ label, value, ariaLabel }) => {
            const isPressed = priorityFilter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onPriorityFilterChange(value)}
                aria-label={ariaLabel}
                aria-pressed={isPressed}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  isPressed
                    ? "bg-white dark:bg-[#1a1d24] text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          aria-label="Filter by category"
          className="rounded-xl border border-slate-200 dark:border-[#2e3340] bg-slate-50 dark:bg-[#22262f] px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Reset Filters button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            aria-label="Reset filters"
            className="px-2.5 py-1 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Right: Sort Dropdown & Search Button / Bar beside it */}
      <div className="flex items-center gap-2">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          aria-label="Sort todos by"
          className="rounded-xl border border-slate-200 dark:border-[#2e3340] bg-slate-50 dark:bg-[#22262f] px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none cursor-pointer"
        >
          <option value="newest">Sort: Newest</option>
          <option value="dueDate">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
        </select>

        {/* Search button & input beside sort menu */}
        <div className="relative flex items-center">
          <input
            id="tasks-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="w-36 sm:w-48 rounded-xl border border-slate-200 dark:border-[#2e3340] bg-slate-50 dark:bg-[#22262f] pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("tasks-search-input");
              el?.focus();
            }}
            aria-label="Search tasks button"
            className="absolute left-2.5 text-slate-400 dark:text-zinc-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <Search aria-hidden="true" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
