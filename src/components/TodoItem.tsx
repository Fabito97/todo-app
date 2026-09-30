"use client";

import React, { useState } from "react";
import { Edit3, X } from "lucide-react";
import type { Todo, TodoPatchInput } from "@/lib/schemas";
import { formatShortDate, isOverdue, formatOverdueLabel } from "@/lib/date-utils";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onOpenEdit?: (todo: Todo) => void;
  onOpenDetails?: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, updates: TodoPatchInput | string) => Promise<unknown> | void;
}

export function TodoItem({
  todo,
  onToggle,
  onOpenEdit,
  onOpenDetails,
  onDelete,
}: TodoItemProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isOverdueItem = isOverdue(todo.dueDate, todo.completed);

  const priorityBorderClass = todo.completed
    ? "border-l-emerald-500 dark:border-l-emerald-400"
    : todo.priority === "high"
    ? "border-l-rose-500 dark:border-l-rose-400"
    : todo.priority === "medium"
    ? "border-l-amber-500 dark:border-l-amber-400"
    : "border-l-blue-500 dark:border-l-blue-400";

  return (
    <li
      role="listitem"
      onClick={() => onOpenDetails?.(todo)}
      className={`group flex flex-col p-4 rounded-2xl border border-slate-200 dark:border-[#2e3340] border-l-4 ${priorityBorderClass} bg-white dark:bg-[#1a1d24] shadow-xs hover:shadow-md transition-all cursor-pointer`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => {
                e.stopPropagation();
                onToggle(todo.id, e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Toggle completion for ${todo.title}`}
              className="h-4 w-4 rounded-md border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-colors shrink-0"
            />
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails?.(todo);
                }}
                aria-label={`View details for ${todo.title}`}
                className={`text-sm text-left truncate select-none cursor-pointer w-full font-semibold transition-colors ${
                  todo.completed
                    ? "line-through text-slate-400 dark:text-zinc-500"
                    : isOverdueItem
                    ? "text-slate-800 dark:text-zinc-100 line-through decoration-rose-400/80"
                    : "text-slate-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
              >
                {todo.title}
              </button>
              {todo.description && (
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                  {todo.description}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div
            className="flex items-center gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {onOpenEdit && (
              <button
                type="button"
                onClick={() => onOpenEdit(todo)}
                aria-label={`Edit ${todo.title}`}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-[#22262f] transition-colors text-xs font-medium cursor-pointer flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              aria-label={`Delete ${todo.title}`}
              className="p-1.5 sm:px-2 sm:py-1 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Delete confirmation inline bar */}
        {isConfirmingDelete && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 mt-1"
          >
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              Confirm delete?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2 py-0.5 text-xs text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#22262f] rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(todo.id);
                  setIsConfirmingDelete(false);
                }}
                className="px-2 py-0.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer"
              >
                Confirm delete
              </button>
            </div>
          </div>
        )}

        {/* Metadata Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pl-7 mt-2 text-[11px]">
          <span
            className={`px-2 py-0.5 rounded-full border font-bold capitalize ${
              todo.priority === "high"
                ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700"
                : todo.priority === "medium"
                ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700"
                : "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700"
            }`}
          >
            {todo.priority}
          </span>

          {todo.category && (
            <span className="px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-[#22262f] text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-[#2e3340]">
              {todo.category}
            </span>
          )}

          {todo.startTime && (
            <span className="px-2 py-0.5 rounded-full border font-semibold font-mono bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800">
              {todo.startTime}
              {todo.endTime ? ` – ${todo.endTime}` : ""}
            </span>
          )}

          {todo.dueDate && !isOverdueItem && (
            <span className="px-2 py-0.5 rounded-full border font-medium bg-slate-50 text-slate-600 border-slate-200 dark:bg-[#22262f] dark:text-zinc-300 dark:border-[#2e3340]">
              Due: {formatShortDate(todo.dueDate)}
            </span>
          )}

          {isOverdueItem && (
            <span className="px-2 py-0.5 rounded-full border font-semibold bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800">
              {formatOverdueLabel(todo.dueDate)}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
