"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Todo } from "@/lib/schemas";
import { CreateTodoSchema } from "@/lib/schemas";
import { ZodError } from "zod";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string, title: string) => Promise<unknown> | void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditTitle(todo.title);
    setError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setError(null);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      const validated = CreateTodoSchema.parse({ title: editTitle });
      setError(null);
      await onEdit(todo.id, validated.title);
      setIsEditing(false);
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors[0]?.message || "Invalid title");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to edit todo");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <li
      role="listitem"
      className="group flex flex-col p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => onToggle(todo.id, e.target.checked)}
            aria-label={`Toggle completion for ${todo.title}`}
            className="h-4 w-4 rounded-md border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-colors"
          />

          {isEditing ? (
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                onBlur={handleCancelEdit}
                aria-label="Edit todo title"
                aria-invalid={!!error}
                className="w-full rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-zinc-800 px-2.5 py-1 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          ) : (
            <span
              onDoubleClick={handleStartEdit}
              className={`text-sm truncate select-none cursor-pointer flex-1 ${
                todo.completed
                  ? "line-through text-zinc-400 dark:text-zinc-600"
                  : "text-zinc-800 dark:text-zinc-200 font-medium"
              }`}
            >
              {todo.title}
            </span>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleStartEdit}
              aria-label={`Edit ${todo.title}`}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => onDelete(todo.id)}
              aria-label={`Delete ${todo.title}`}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {isEditing && error && (
        <p
          role="alert"
          className="text-xs font-medium text-rose-500 dark:text-rose-400 mt-1.5 pl-7"
        >
          {error}
        </p>
      )}
    </li>
  );
}
