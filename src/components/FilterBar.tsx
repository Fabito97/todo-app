"use client";

import React from "react";
import type { TodoFilter } from "@/services";

interface FilterBarProps {
  activeCount: number;
  currentFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
}

const FILTERS: { label: string; value: TodoFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

export function FilterBar({
  activeCount,
  currentFilter,
  onFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400">
      <span className="font-medium">
        {activeCount} {activeCount === 1 ? "item" : "items"} left
      </span>

      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 backdrop-blur-xs">
        {FILTERS.map(({ label, value }) => {
          const isSelected = currentFilter === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onFilterChange(value)}
              aria-current={isSelected ? "page" : undefined}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                isSelected
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
