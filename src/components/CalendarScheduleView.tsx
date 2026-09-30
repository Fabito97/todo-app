"use client";

import React, { useState } from "react";
import type { Todo } from "@/lib/schemas";

interface CalendarScheduleViewProps {
  todos: Todo[];
  onToggle: (id: string, completed: boolean) => void;
}

function addDays(dateStr: string, offset: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y || 2026, (m || 1) - 1, (d || 1) + offset));
  return dt.toISOString().slice(0, 10);
}

export function CalendarScheduleView({ todos, onToggle }: CalendarScheduleViewProps) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const dayTodos = todos.filter((t) => t.dueDate === selectedDate);

  const timeBlockedTodos = dayTodos
    .filter((t) => Boolean(t.startTime || t.endTime))
    .sort((a, b) => (a.startTime || "23:59").localeCompare(b.startTime || "23:59"));

  const allDayTodos = dayTodos.filter((t) => !t.startTime && !t.endTime);

  const weekDates = [-2, -1, 0, 1, 2, 3, 4].map((offset) => addDays(selectedDate, offset));

  return (
    <section
      aria-label="Calendar and schedule"
      className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-5 sm:p-6 shadow-md shadow-slate-200/40 dark:shadow-black/40 space-y-5"
    >
      {/* Date Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-[#2e3340] pb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            Daily Time-Block Schedule
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Viewing schedule for <span className="font-mono font-semibold">{selectedDate}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedDate((prev) => addDays(prev, -1))}
            aria-label="Previous day"
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#2e3340] bg-slate-50 dark:bg-[#22262f] text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr)}
            aria-label="Today"
            className="px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate((prev) => addDays(prev, 1))}
            aria-label="Next day"
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#2e3340] bg-slate-50 dark:bg-[#22262f] text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Next
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            aria-label="Select schedule date"
            className="rounded-lg border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#22262f] px-2.5 py-1.5 text-xs text-slate-800 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* 7-day Quick Strip */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekDates.map((d) => {
          const isSelected = d === selectedDate;
          const countForDay = todos.filter((t) => t.dueDate === d).length;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDate(d)}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-xs"
                  : "bg-slate-50 dark:bg-[#22262f] border-slate-200 dark:border-[#2e3340] text-slate-700 dark:text-zinc-300 hover:border-indigo-400"
              }`}
            >
              <div className="text-[10px] font-mono opacity-80">{d.slice(5)}</div>
              <div className="text-[11px] font-bold mt-0.5">{countForDay} tasks</div>
            </button>
          );
        })}
      </div>

      {/* Time-Blocked Schedule Section */}
      <div
        role="region"
        aria-label="Time-blocked schedule"
        className="space-y-2.5"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
          Time-Blocked Schedule ({timeBlockedTodos.length})
        </h3>

        {timeBlockedTodos.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-[#2e3340] text-center text-xs text-slate-500 dark:text-zinc-400">
            No time-blocked events for {selectedDate}. Add a start and end time when creating a task to block time on your schedule.
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {timeBlockedTodos.map((todo) => (
              <li
                key={todo.id}
                role="listitem"
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-[#2e3340] border-l-4 border-l-indigo-500 bg-slate-50/70 dark:bg-[#22262f]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                    {todo.startTime && todo.endTime
                      ? `${todo.startTime} – ${todo.endTime}`
                      : todo.startTime
                        ? `From ${todo.startTime}`
                        : `Until ${todo.endTime}`}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        todo.completed
                          ? "line-through text-slate-400 dark:text-zinc-500"
                          : "text-slate-900 dark:text-zinc-100"
                      }`}
                    >
                      {todo.title}
                    </p>
                    {todo.category && (
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {todo.category}
                      </span>
                    )}
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(e) => onToggle(todo.id, e.target.checked)}
                  aria-label={`Complete scheduled task ${todo.title}`}
                  className="h-4 w-4 rounded border-slate-300 dark:border-zinc-600 text-indigo-600 cursor-pointer"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* All-Day / Unscheduled Tasks for Selected Date */}
      <div
        role="region"
        aria-label="All-day tasks"
        className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#2e3340]"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
          All-Day / Unscheduled Tasks ({allDayTodos.length})
        </h3>
        {allDayTodos.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            No unscheduled all-day tasks due on {selectedDate}.
          </p>
        ) : (
          <ul role="list" className="space-y-1.5">
            {allDayTodos.map((todo) => (
              <li
                key={todo.id}
                role="listitem"
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-[#2e3340] bg-slate-50/50 dark:bg-[#22262f] text-xs"
              >
                <span className="font-medium text-slate-800 dark:text-zinc-100">
                  {todo.title}
                </span>
                <span className="text-[11px] capitalize text-slate-500 dark:text-zinc-400">
                  {todo.priority} priority
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
