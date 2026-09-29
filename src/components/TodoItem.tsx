"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Todo, Priority, TodoPatchInput } from "@/lib/schemas";
import { TodoPatchSchema } from "@/lib/schemas";
import { ZodError } from "zod";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string, patch: TodoPatchInput | string) => Promise<unknown> | void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || "");
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority || "medium");
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || "");
  const [editCategory, setEditCategory] = useState(todo.category || "");
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setEditPriority(todo.priority || "medium");
    setEditDueDate(todo.dueDate || "");
    setEditCategory(todo.category || "");
    setError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setEditPriority(todo.priority || "medium");
    setEditDueDate(todo.dueDate || "");
    setEditCategory(todo.category || "");
    setError(null);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      const patchData: TodoPatchInput = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        dueDate: editDueDate ? editDueDate : null,
        category: editCategory.trim() ? editCategory.trim() : null,
      };

      const validated = TodoPatchSchema.parse(patchData);
      setError(null);
      await onEdit(todo.id, validated);
      setIsEditing(false);
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors[0]?.message || "Invalid input");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to edit todo");
      }
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // Due date & overdue calculation
  const todayStr = new Date().toISOString().slice(0, 10);
  const isOverdue = !!(todo.dueDate && !todo.completed && todo.dueDate < todayStr);

  const priorityStyles = {
    high: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    medium:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    low: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
  }[todo.priority || "medium"];

  return (
    <li
      role="listitem"
      onKeyDown={(e) => {
        if (e.key === "Escape" && isEditing) {
          e.preventDefault();
          handleCancelEdit();
        }
      }}
      className="group flex flex-col p-3.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
    >
      {/* Normal view mode */}
      {!isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => onToggle(todo.id, e.target.checked)}
                aria-label={`Toggle completion for ${todo.title}`}
                className="h-4 w-4 rounded-md border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-colors"
              />

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
            </div>

            <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
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
          </div>

          {/* Badges: Priority, Due Date, Category */}
          <div className="flex flex-wrap items-center gap-1.5 pl-7 text-[11px]">
            {/* Priority Badge */}
            <span
              className={`px-2 py-0.5 rounded-full border font-semibold capitalize ${priorityStyles}`}
            >
              {todo.priority || "medium"}
            </span>

            {/* Category Tag */}
            {todo.category && (
              <span className="px-2 py-0.5 rounded-full border bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                {todo.category}
              </span>
            )}

            {/* Due Date Indicator */}
            {todo.dueDate && (
              <span
                className={`px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${
                  isOverdue
                    ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700"
                }`}
              >
                {isOverdue ? `Overdue: ${todo.dueDate}` : `Due: ${todo.dueDate}`}
              </span>
            )}

            {/* Description toggle if present */}
            {todo.description && (
              <button
                type="button"
                onClick={() => setShowNotes((prev) => !prev)}
                aria-label={showNotes ? "Hide description" : "Show description"}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 underline text-[10px] ml-1 cursor-pointer"
              >
                {showNotes ? "Hide notes" : "View notes"}
              </button>
            )}
          </div>

          {/* Notes display */}
          {showNotes && todo.description && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 pl-7 pt-1 whitespace-pre-wrap leading-relaxed">
              {todo.description}
            </p>
          )}
        </div>
      ) : (
        /* Edit view mode */
        <div className="space-y-3 p-1">
          <div className="space-y-1">
            <input
              ref={titleInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleTitleKeyDown}
              aria-label="Edit todo title"
              aria-invalid={!!error}
              className="w-full rounded-lg border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="space-y-1">
            <textarea
              value={editDescription}
              onChange={(e) => {
                setEditDescription(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Description (optional)"
              aria-label="Edit description"
              rows={2}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* Priority selection */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400">Priority</label>
              <div className="flex gap-1" role="group" aria-label="Edit priority">
                {(["low", "medium", "high"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEditPriority(p)}
                    aria-label={`Priority ${p}`}
                    className={`flex-1 capitalize py-1 px-1.5 rounded border text-[10px] font-semibold cursor-pointer ${
                      editPriority === p
                        ? "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300"
                        : "bg-white/60 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due date picker */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400">Due date</label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                aria-label="Edit due date"
                className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Category input */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400">Category</label>
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="Category"
                aria-label="Edit category"
                className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-500 dark:text-rose-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancelEdit}
              aria-label="Cancel editing"
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              aria-label="Save changes"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
