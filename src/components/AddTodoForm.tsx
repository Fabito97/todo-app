"use client";

import React, { useState } from "react";
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
  const [category, setCategory] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: CreateTodoInput = {
        title,
        description: description.trim() ? description.trim() : undefined,
        priority,
        dueDate: dueDate ? dueDate : null,
        category: category.trim() ? category.trim() : null,
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
          className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-sm transition-all shadow-sm"
          disabled={isSubmitting}
        />

        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          aria-label="Toggle details"
          aria-expanded={showDetails}
          title={showDetails ? "Hide extra details" : "Add details (priority, due date, category)"}
          className={`px-3 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer flex items-center justify-center ${
            showDetails
              ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
              : "bg-white/70 dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
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
        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-3 transition-all animate-in fade-in duration-150">
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
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Priority selection */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Priority
              </label>
              <div className="flex gap-1.5" role="group" aria-label="Priority">
                {(["low", "medium", "high"] as const).map((p) => {
                  const isSelected = priority === p;
                  const activeColors = {
                    low: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
                    medium:
                      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
                    high: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
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
                          : "bg-white/60 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
              >
                Due date
              </label>
              <input
                id="todo-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                aria-label="Due date"
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* Category tag */}
            <div className="space-y-1">
              <label
                htmlFor="todo-category"
                className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
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
                className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-zinc-400">Presets:</span>
            {CATEGORY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCategory(preset)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                  category.toLowerCase() === preset.toLowerCase()
                    ? "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 font-medium"
                    : "bg-white/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
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
