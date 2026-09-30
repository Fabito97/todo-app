"use client";

import React from "react";
import type { Todo } from "@/lib/schemas";

interface DashboardOverviewProps {
  todos: Todo[];
  onToggle: (id: string, completed: boolean) => void;
}

export function DashboardOverview({ todos, onToggle }: DashboardOverviewProps) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const totalCount = todos.length;
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = totalCount - activeCount;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const todaysTasks = todos
    .filter((t) => t.dueDate === todayStr)
    .sort((a, b) => {
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      if (a.startTime && !b.startTime) return -1;
      if (!a.startTime && b.startTime) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

  return (
    <section
      aria-label="Task progress summary"
      className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-4 sm:p-5 shadow-md shadow-slate-200/40 dark:shadow-black/40 space-y-4"
    >
      {/* Top Row: Stat Pills & Completion % */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#22262f] text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-[#2e3340]">
            Total: <strong className="font-semibold">{totalCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
            Active: <strong className="font-semibold">{activeCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            Completed: <strong className="font-semibold">{completedCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Due Today: <strong className="font-semibold">{todaysTasks.length}</strong>
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
          {completionPercentage}% done
        </span>
      </div>

      {/* Progress Bar */}
      <div
        role="progressbar"
        aria-label="Task completion progress"
        aria-valuenow={completionPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#22262f] overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Tasks for the Day */}
      <div
        role="region"
        aria-label="Tasks for the day"
        className="pt-2 border-t border-slate-100 dark:border-[#2e3340] space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-300 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Tasks for the Day
          </h2>
          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
            {todayStr}
          </span>
        </div>

        {todaysTasks.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400 py-1.5">
            No tasks scheduled for today. Set a due date of today to see your daily agenda here.
          </p>
        ) : (
          <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {todaysTasks.map((task) => (
              <li
                key={task.id}
                role="listitem"
                className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-[#2e3340] bg-slate-50/70 dark:bg-[#22262f] text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => onToggle(task.id, e.target.checked)}
                    aria-label={`Complete today's task ${task.title}`}
                    className="h-3.5 w-3.5 rounded border-slate-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span
                    className={`truncate font-medium ${
                      task.completed
                        ? "line-through text-slate-400 dark:text-zinc-500"
                        : "text-slate-800 dark:text-zinc-100"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                {(task.startTime || task.endTime) ? (
                  <span className="shrink-0 px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {task.startTime && task.endTime
                      ? `${task.startTime} – ${task.endTime}`
                      : task.startTime
                        ? `From ${task.startTime}`
                        : `Until ${task.endTime}`}
                  </span>
                ) : (
                  <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] text-slate-500 dark:text-zinc-400 bg-slate-200/60 dark:bg-zinc-800">
                    All day
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
