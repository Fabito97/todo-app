"use client";

import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { CreateTodoInput, Priority } from "@/lib/schemas";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (todo: CreateTodoInput) => Promise<void>;
}

const PRESET_CATEGORIES = ["Work", "Personal", "Errands", "Health", "Finance", "Study"];

export function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  if (!isOpen) return null;
  return <AddTaskModalContent onClose={onClose} onAdd={onAdd} />;
}

function AddTaskModalContent({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (todo: CreateTodoInput) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

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
      const payload: CreateTodoInput = {
        title: trimmedTitle,
        priority,
      };

      if (description.trim()) {
        payload.description = description.trim();
      }
      if (dueDate) {
        payload.dueDate = dueDate;
      }
      if (startTime) {
        payload.startTime = startTime;
      }
      if (endTime) {
        payload.endTime = endTime;
      }
      if (category.trim()) {
        payload.category = category.trim();
      }

      await onAdd(payload);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task");
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
        aria-label="New Task"
        className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-6 shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-y-auto space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2e3340]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
            New Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X aria-hidden="true" className="w-5 h-5" />
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Task title"
              placeholder="What needs to be done?"
              className="w-full rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              aria-label="Task description"
              placeholder="Add extra context or details…"
              className="w-full rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3.5 py-2 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Priority
            </label>
            <div role="radiogroup" aria-label="Priority" className="flex gap-2">
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={priority === p}
                  aria-label={`${p} priority`}
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
                htmlFor="new-task-due-date"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                Due Date
              </label>
              <input
                id="new-task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                aria-label="Due date"
                className="w-full rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label
                htmlFor="new-task-start-time"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                Start Time
              </label>
              <input
                id="new-task-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                aria-label="Start time"
                className="w-full rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label
                htmlFor="new-task-end-time"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
              >
                End Time
              </label>
              <input
                id="new-task-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                aria-label="End time"
                className="w-full rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="new-task-category"
              className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1"
            >
              Category
            </label>
            <select
              id="new-task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Task category"
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
              Create task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
