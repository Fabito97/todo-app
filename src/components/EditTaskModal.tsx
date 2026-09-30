"use client";

import React, { useState, useEffect } from "react";
import { Priority, Todo, TodoPatchInput } from "@/lib/schemas";

interface EditTaskModalProps {
  isOpen: boolean;
  todo: Todo | null;
  onClose: () => void;
  onSave: (id: string, updates: TodoPatchInput) => Promise<void>;
}

const PRESET_CATEGORIES = ["Work", "Personal", "Errands", "Health", "Finance", "Study"];

export function EditTaskModal({
  isOpen,
  todo,
  onClose,
  onSave,
}: EditTaskModalProps) {
  if (!isOpen || !todo) return null;
  return (
    <EditTaskModalContent
      key={todo.id}
      todo={todo}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function EditTaskModalContent({
  todo,
  onClose,
  onSave,
}: {
  todo: Todo;
  onClose: () => void;
  onSave: (id: string, updates: TodoPatchInput) => Promise<void>;
}) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [dueDate, setDueDate] = useState(todo.dueDate || "");
  const [startTime, setStartTime] = useState(todo.startTime || "");
  const [endTime, setEndTime] = useState(todo.endTime || "");
  const [category, setCategory] = useState(todo.category || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    if (startTime && endTime && endTime <= startTime) {
      setError("End time must be after start time");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const updates: TodoPatchInput = {
        title: trimmedTitle,
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        startTime: startTime || null,
        endTime: endTime || null,
        category: category.trim() || "",
      };

      await onSave(todo.id, updates);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        aria-label="Edit task"
        className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-6 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-y-auto space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2e3340]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
            Edit Task
          </h2>
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

        {error && (
          <p
            role="alert"
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60"
          >
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit-task-title"
              className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
            >
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Edit title"
              className="w-full rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label
              htmlFor="edit-task-desc"
              className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
            >
              Description / Notes
            </label>
            <textarea
              id="edit-task-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Edit description"
              className="w-full rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3.5 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Priority
            </label>
            <div role="radiogroup" aria-label="Edit priority" className="flex gap-2">
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={priority === p}
                  aria-label={`Priority ${p}`}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold capitalize border cursor-pointer transition-all ${
                    priority === p
                      ? p === "high"
                        ? "bg-rose-100 text-rose-800 border-rose-400 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700"
                        : p === "medium"
                        ? "bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700"
                        : "bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700"
                      : "bg-slate-50 dark:bg-[#22262f] text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-[#2e3340] hover:bg-slate-100 dark:hover:bg-[#2a2f3a]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due date, start time, end time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="edit-task-due-date"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                Due Date
              </label>
              <input
                id="edit-task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                aria-label="Edit due date"
                className="w-full rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label
                htmlFor="edit-task-start-time"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                Start Time
              </label>
              <input
                id="edit-task-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                aria-label="Edit start time"
                className="w-full rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label
                htmlFor="edit-task-end-time"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                End Time
              </label>
              <input
                id="edit-task-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                aria-label="Edit end time"
                className="w-full rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="edit-task-category"
              className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
            >
              Category
            </label>
            <select
              id="edit-task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Edit category"
              className="w-full rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">None</option>
              {PRESET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#2e3340]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#22262f] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
