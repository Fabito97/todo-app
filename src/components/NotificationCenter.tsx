"use client";

import React, { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";
import type { Todo } from "@/lib/schemas";

export function getReminders(todos: Todo[]) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const overdueTodos = todos.filter(
    (t) => Boolean(t.dueDate && !t.completed && t.dueDate < todayStr)
  );
  const todayScheduledTodos = todos.filter(
    (t) => Boolean(t.dueDate === todayStr && !t.completed)
  );

  return [
    ...overdueTodos.map((t) => ({ todo: t, kind: "overdue" as const })),
    ...todayScheduledTodos.map((t) => ({ todo: t, kind: "today" as const })),
  ];
}

interface NotificationCenterProps {
  todos: Todo[];
}

export function NotificationCenter({ todos }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const reminders = getReminders(todos);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#1a1d24] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#22262f] transition-colors cursor-pointer shadow-xs"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          {reminders.length}
        </span>
      </button>

      {isOpen && (
        <div
          role="region"
          aria-label="Notifications panel"
          className="absolute right-0 mt-2 w-80 max-w-[90vw] z-30 rounded-2xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#1a1d24] p-4 shadow-xl shadow-slate-900/15 dark:shadow-black/60 space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2e3340] pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200">
              Schedule Alerts &amp; Reminders
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
              {reminders.length} active
            </span>
          </div>

          {reminders.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-2">
              No active reminders — you&apos;re all caught up!
            </p>
          ) : (
            <ul role="list" className="space-y-2 max-h-64 overflow-y-auto">
              {reminders.map(({ todo, kind }) => (
                <li
                  key={todo.id}
                  role="listitem"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-[#2e3340] bg-slate-50 dark:bg-[#22262f] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {todo.title}
                    </span>
                    {kind === "overdue" ? (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        Overdue
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {todo.startTime && todo.endTime
                          ? `${todo.startTime} – ${todo.endTime}`
                          : "Due Today"}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {kind === "overdue" ? `Due ${todo.dueDate}` : `Scheduled for today (${todo.dueDate})`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  todos: Todo[];
}

export function NotificationModal({
  isOpen,
  onClose,
  todos,
}: NotificationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const reminders = getReminders(todos);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notifications panel"
        className="relative w-full max-w-md z-10 rounded-2xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#1a1d24] p-5 shadow-2xl space-y-4 max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2e3340] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Bell aria-hidden="true" className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Schedule Alerts &amp; Reminders
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                {reminders.length} active reminders
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#22262f] transition cursor-pointer"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {reminders.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-zinc-400 text-xs space-y-1">
            <p className="font-semibold text-slate-700 dark:text-zinc-300">All caught up!</p>
            <p>No active reminders or overdue tasks.</p>
          </div>
        ) : (
          <ul role="list" className="space-y-2.5 overflow-y-auto pr-1">
            {reminders.map(({ todo, kind }) => (
              <li
                key={todo.id}
                role="listitem"
                className="p-3 rounded-xl border border-slate-200 dark:border-[#2e3340] bg-slate-50 dark:bg-[#22262f] text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {todo.title}
                  </span>
                  {kind === "overdue" ? (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      Overdue
                    </span>
                  ) : (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {todo.startTime && todo.endTime
                        ? `${todo.startTime} – ${todo.endTime}`
                        : "Due Today"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {kind === "overdue" ? `Due ${todo.dueDate}` : `Scheduled for today (${todo.dueDate})`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

