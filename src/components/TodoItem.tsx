"use client";

import React, { useState } from "react";
import type { Todo, TodoPatchInput } from "@/lib/schemas";

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

  const todayStr = new Date().toISOString().slice(0, 10);
  const isOverdue = Boolean(todo.dueDate && !todo.completed && todo.dueDate < todayStr);

  const priorityBorderClass =
    todo.priority === "high"
      ? "border-l-rose-500 dark:border-l-rose-400"
      : todo.priority === "medium"
      ? "border-l-amber-500 dark:border-l-amber-400"
      : "border-l-blue-500 dark:border-l-blue-400";

  return (
    <li
      role="listitem"
      className={`group flex flex-col p-3.5 rounded-xl border border-slate-200 dark:border-[#2e3340] border-l-4 ${priorityBorderClass} bg-white dark:bg-[#1a1d24] transition-all hover:border-slate-300 dark:hover:border-zinc-600 hover:shadow-xs`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => onToggle(todo.id, e.target.checked)}
              aria-label={`Toggle completion for ${todo.title}`}
              className="h-4 w-4 rounded-md border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-colors"
            />
            <button
              type="button"
              onClick={() => onOpenDetails?.(todo)}
              aria-label={`View details for ${todo.title}`}
              className={`text-sm text-left truncate select-none cursor-pointer flex-1 font-medium transition-colors ${
                todo.completed
                  ? "line-through text-slate-400 dark:text-zinc-500"
                  : "text-slate-800 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              {todo.title}
            </button>
          </div>

          <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {onOpenEdit && (
              <button
                type="button"
                onClick={() => onOpenEdit(todo)}
                aria-label={`Edit ${todo.title}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#22262f] transition-colors cursor-pointer"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              aria-label={`Delete ${todo.title}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-[#22262f] transition-colors cursor-pointer"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Delete confirmation inline bar */}
        {isConfirmingDelete && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 mt-1">
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

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 pl-7 text-[11px]">
          <span
            className={`px-2 py-0.5 rounded-full border font-semibold capitalize ${
              todo.priority === "high"
                ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700"
                : todo.priority === "medium"
                ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700"
                : "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700"
            }`}
          >
            {todo.priority}
          </span>

          {todo.startTime && (
            <span className="px-2 py-0.5 rounded-full border font-semibold font-mono bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800">
              {todo.startTime}
              {todo.endTime ? ` – ${todo.endTime}` : ""}
            </span>
          )}

          {todo.category && (
            <span className="px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-[#22262f] text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-[#2e3340]">
              {todo.category}
            </span>
          )}

          {todo.dueDate && (
            <span
              className={`px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${
                isOverdue
                  ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                  : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-[#22262f] dark:text-zinc-300 dark:border-[#2e3340]"
              }`}
            >
              {isOverdue ? `Overdue: ${todo.dueDate}` : `Due: ${todo.dueDate}`}
            </span>
          )}

          {todo.description && (
            <button
              type="button"
              onClick={() => onOpenDetails?.(todo)}
              aria-label="View notes"
              className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white underline text-[10px] ml-1 cursor-pointer"
            >
              View notes
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
