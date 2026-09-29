"use client";

import React, { useState } from "react";
import { CreateTodoSchema } from "@/lib/schemas";
import { ZodError } from "zod";

interface AddTodoFormProps {
  onAdd: (title: string) => Promise<unknown> | void;
}

export function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = CreateTodoSchema.parse({ title });
      setError(null);
      setIsSubmitting(true);
      await onAdd(validated.title);
      setTitle("");
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors[0]?.message || "Invalid title");
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
    <form onSubmit={handleSubmit} className="w-full space-y-2">
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
          type="submit"
          aria-label="Add todo"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:from-indigo-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
        >
          Add Todo
        </button>
      </div>
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
