"use client";

import React, { useState, useEffect } from "react";
import { Todo } from "@/lib/schemas";

interface TaskDetailsModalProps {
  isOpen: boolean;
  todo: Todo | null;
  onClose: () => void;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TaskDetailsModal({
  isOpen,
  todo,
  onClose,
  onToggle,
  onEdit,
  onDelete,
}: TaskDetailsModalProps) {
  if (!isOpen || !todo) return null;
  return (
    <TaskDetailsModalContent
      key={todo.id}
      todo={todo}
      onClose={onClose}
      onToggle={onToggle}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function TaskDetailsModalContent({
  todo,
  onClose,
  onToggle,
  onEdit,
  onDelete,
}: {
  todo: Todo;
  onClose: () => void;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const isOverdue = Boolean(todo.dueDate && !todo.completed && todo.dueDate < todayStr);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-6 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-y-auto space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-[#2e3340]">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 leading-snug">
              {todo.title}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  todo.priority === "high"
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    : todo.priority === "medium"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                }`}
              >
                {todo.priority}
              </span>

              {todo.category && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#22262f] text-slate-600 dark:text-zinc-300 font-medium">
                  {todo.category}
                </span>
              )}

              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  todo.completed
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                }`}
              >
                {todo.completed ? "Completed" : "Active"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Details */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Due date & time block */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-[#22262f] p-3.5 rounded-xl border border-slate-100 dark:border-[#2e3340]">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase">
                Due Date
              </p>
              <p className="font-medium text-slate-800 dark:text-zinc-200 mt-0.5">
                {todo.dueDate || "No due date"}
              </p>
              {isOverdue && (
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  Overdue
                </span>
              )}
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase">
                Time Block
              </p>
              <p className="font-medium text-slate-800 dark:text-zinc-200 mt-0.5">
                {todo.startTime
                  ? `${todo.startTime}${todo.endTime ? ` – ${todo.endTime}` : ""}`
                  : "All day"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Description / Notes
            </p>
            <p className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#22262f] text-slate-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed min-h-[60px]">
              {todo.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#2e3340] space-y-3">
          {isConfirmingDelete ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                Delete this task?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#22262f] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(todo.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
                >
                  Confirm delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onToggle(todo.id, !todo.completed);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  todo.completed
                    ? "bg-slate-100 dark:bg-[#22262f] text-slate-700 dark:text-zinc-200 hover:bg-slate-200"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                }`}
              >
                {todo.completed ? "Mark as active" : "Mark as completed"}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(todo);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#1a1d24] text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#22262f] cursor-pointer"
                >
                  Edit task
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  Delete task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
