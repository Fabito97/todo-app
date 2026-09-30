"use client";

import React, { useState, useEffect } from "react";
import type { Priority, CreateTodoInput } from "@/lib/schemas";
import { CreateTodoSchema } from "@/lib/schemas";
import { ZodError } from "zod";

interface AddTodoFormProps {
  onAdd: (data: CreateTodoInput) => Promise<unknown> | void;
}

const CATEGORY_PRESETS = ["Work", "Personal", "Shopping", "Other"] as const;

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!showDetails) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowDetails(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: CreateTodoInput = {
        title,
        description: description.trim() ? description.trim() : undefined,
        priority,
        dueDate: dueDate ? dueDate : null,
        category: category.trim() ? category.trim() : null,
        ...(startTime ? { startTime } : {}),
        ...(endTime ? { endTime } : {}),
      };

      const validated = CreateTodoSchema.parse(payload);
      setError(null);
      setIsSubmitting(true);
      await onAdd(validated);

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setStartTime("");
      setEndTime("");
      setCategory("");
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors[0]?.message || "Invalid input");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add todo");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          placeholder="What needs to be done?"
          aria-label="Todo title"
          aria-invalid={!!error}
          aria-describedby={error ? "todo-input-error" : undefined}
          className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-4 py-3 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-xs"
          disabled={isSubmitting}
        />

        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          aria-label="Toggle details"
          aria-expanded={showDetails}
          title={showDetails ? "Hide task details modal" : "Schedule & details (priority, due date, time block, category)"}
          className={`px-3.5 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 justify-center ${
            showDetails
              ? "bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
              : "bg-white dark:bg-[#22262f] border-slate-200 dark:border-[#2e3340] text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden sm:inline">Schedule</span>
        </button>

        <button
          type="submit"
          aria-label="Add todo"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:from-indigo-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
        >
          Add Todo
        </button>
      </div>

      {showDetails && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Task details and schedule"
          className="p-4 sm:p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-500/40 bg-slate-50/95 dark:bg-[#1a1d24] shadow-lg shadow-slate-900/10 dark:shadow-black/50 space-y-4 transition-all"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2e3340] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200">
                Task Details &amp; Time-Block Composer
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              aria-label="Close modal"
              className="px-2 py-1 rounded-lg text-xs font-medium text-slate-500 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-[#22262f] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>

          <div>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Notes / description (optional)"
              aria-label="Description"
              rows={2}
              className="w-full rounded-lg border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Priority selection */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-300">
                Priority
              </label>
              <div className="flex gap-1.5" role="group" aria-label="Priority">
                {(["low", "medium", "high"] as const).map((p) => {
                  const isSelected = priority === p;
                  const activeColors = {
                    low: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700",
                    medium:
                      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700",
                    high: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700",
                  }[p];

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      aria-label={`Priority ${p}`}
                      className={`flex-1 capitalize py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? activeColors
                          : "bg-white dark:bg-[#22262f] border-slate-200 dark:border-[#2e3340] text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due date picker */}
            <div className="space-y-1">
              <label
                htmlFor="todo-due-date"
                className="text-[11px] font-medium text-slate-600 dark:text-zinc-300"
              >
                Due date
              </label>
              <input
                id="todo-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                aria-label="Due date"
                className="w-full rounded-lg border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* Category tag */}
            <div className="space-y-1">
              <label
                htmlFor="todo-category"
                className="text-[11px] font-medium text-slate-600 dark:text-zinc-300"
              >
                Category
              </label>
              <input
                id="todo-category"
                type="text"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Work, Personal"
                aria-label="Category"
                className="w-full rounded-lg border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Time-blocking inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="space-y-1">
              <label
                htmlFor="todo-start-time"
                className="text-[11px] font-medium text-slate-600 dark:text-zinc-300"
              >
                Start time (optional)
              </label>
              <input
                id="todo-start-time"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (error) setError(null);
                }}
                aria-label="Start time"
                className="w-full rounded-lg border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="todo-end-time"
                className="text-[11px] font-medium text-slate-600 dark:text-zinc-300"
              >
                End time (optional)
              </label>
              <input
                id="todo-end-time"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (error) setError(null);
                }}
                aria-label="End time"
                className="w-full rounded-lg border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400">Presets:</span>
            {CATEGORY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCategory(preset)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                  category.toLowerCase() === preset.toLowerCase()
                    ? "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-700 font-medium"
                    : "bg-white dark:bg-[#22262f] border-slate-200 dark:border-[#2e3340] text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p
          id="todo-input-error"
          role="alert"
          className="text-xs font-medium text-rose-500 dark:text-rose-400 pl-1"
        >
          {error}
        </p>
      )}
    </form>
  );
}
