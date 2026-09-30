"use client";

import React, { useState } from "react";
import { ClipboardList, Zap, CheckCircle2, Flame, Clock, Plus } from "lucide-react";
import { Todo } from "@/lib/schemas";
import { formatShortDate, isOverdue, formatOverdueLabel } from "@/lib/date-utils";
import { MetricCard } from "./MetricCard";

interface DashboardViewProps {
  todos: Todo[];
  onQuickAdd: (title: string) => Promise<void>;
  onToggle: (id: string, completed: boolean) => Promise<unknown>;
  onEditTask?: (todo: Todo) => void;
}

export function DashboardView({
  todos,
  onQuickAdd,
  onToggle,
  onEditTask,
}: DashboardViewProps) {
  const [quickTitle, setQuickTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalCount = todos.length;
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;
  const criticalCount = todos.filter((t) => !t.completed && t.priority === "high").length;
  const completionPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

  // Today's tasks: dueDate === today, ordered by startTime ascending (nulls last)
  const todayTasks = todos
    .filter((t) => t.dueDate === todayStr)
    .sort((a, b) => {
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      if (a.startTime && !b.startTime) return -1;
      if (!a.startTime && b.startTime) return 1;
      return 0;
    });

  // Important / Critical tasks: active & priority === high
  const criticalTasks = todos.filter((t) => !t.completed && t.priority === "high");

  // Recent tasks: 5 newest by createdAt descending
  const recentTasks = [...todos]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const formatRelativeDate = (isoStr: string) => {
    const createdDate = isoStr.slice(0, 10);
    if (createdDate === todayStr) return "Today";
    if (createdDate === yesterdayStr) return "Yesterday";
    return createdDate;
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onQuickAdd(trimmed);
      setQuickTitle("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Tasks"
          value={totalCount}
          sublabel={`${completionPercent}% done`}
          accent="total"
          icon={<ClipboardList aria-hidden="true" className="w-4 h-4 text-slate-600 dark:text-zinc-400" />}
        />
        <MetricCard
          label="Active Tasks"
          value={activeCount}
          sublabel="tasks remaining"
          accent="active"
          icon={<Zap aria-hidden="true" className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
        />
        <MetricCard
          label="Completed"
          value={completedCount}
          progress={completionPercent}
          accent="completed"
          icon={<CheckCircle2 aria-hidden="true" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        />
        <MetricCard
          label="Critical Tasks"
          value={criticalCount}
          sublabel="high priority"
          accent="critical"
          icon={<Flame aria-hidden="true" className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
        />
      </div>

      {/* Quick Add Task Bar */}
      <form
        onSubmit={handleQuickAddSubmit}
        className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-2.5 shadow-md flex items-center gap-2"
      >
        <div className="pl-2 text-slate-400 dark:text-zinc-500">
          <Plus aria-hidden="true" className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          aria-label="Quick add task title — Todo title"
          placeholder="Add a task quickly…"
          className="flex-1 min-w-0 bg-transparent px-2 py-1.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!quickTitle.trim() || isSubmitting}
          aria-label="Quick add task — Add todo"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          Add
        </button>
      </form>

      {/* Today's Tasks Panel */}
      <section
        aria-label="Today's tasks"
        className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-5 shadow-md space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            Today&apos;s Tasks
          </h3>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            {todayTasks.length} {todayTasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
            No tasks due today. Plan your day by adding a due date.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-[#2e3340]/60">
            {todayTasks.map((task) => (
              <li key={task.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => onToggle(task.id, e.target.checked)}
                    aria-label={`Toggle completion for ${task.title}`}
                    className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      task.startTime
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        : "bg-slate-100 text-slate-600 dark:bg-[#22262f] dark:text-zinc-400"
                    }`}
                  >
                    {task.startTime
                      ? `${task.startTime}${task.endTime ? ` – ${task.endTime}` : ""}`
                      : "All day"}
                  </span>
                  <span
                    className={`text-sm truncate ${
                      task.completed
                        ? "line-through text-slate-400 dark:text-zinc-500"
                        : "text-slate-900 dark:text-zinc-100 font-medium"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    task.priority === "high"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      : task.priority === "medium"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                  }`}
                >
                  {task.priority}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Two-Column Bottom Panels: Important/Critical and Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Important / Critical Tasks Panel */}
        <section
          aria-label="Important and critical tasks"
          className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-5 shadow-md space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Flame aria-hidden="true" className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Important / Critical</span>
            </h3>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              {criticalTasks.length} active
            </span>
          </div>

          {criticalTasks.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
              No critical tasks. Great job!
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-[#2e3340]/60">
              {criticalTasks.map((task) => (
                <li
                  key={task.id}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => onToggle(task.id, e.target.checked)}
                      aria-label={`Toggle completion for ${task.title}`}
                      className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-sm text-slate-900 dark:text-zinc-100 font-medium truncate">
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.dueDate && (
                      <span
                        className={`text-[11px] font-medium ${
                          isOverdue(task.dueDate, task.completed)
                            ? "text-rose-600 dark:text-rose-400 font-semibold"
                            : "text-slate-500 dark:text-zinc-400"
                        }`}
                      >
                        {isOverdue(task.dueDate, task.completed)
                          ? formatOverdueLabel(task.dueDate)
                          : formatShortDate(task.dueDate)}
                      </span>
                    )}
                    {onEditTask && (
                      <button
                        type="button"
                        onClick={() => onEditTask(task)}
                        aria-label={`Edit ${task.title}`}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent Tasks Panel */}
        <section
          aria-label="Recent tasks"
          className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-5 shadow-md space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Clock aria-hidden="true" className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>Recent Tasks</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Latest 5
            </span>
          </div>

          {recentTasks.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
              No tasks yet. Create your first task.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-[#2e3340]/60">
              {recentTasks.map((task) => (
                <li
                  key={task.id}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => onToggle(task.id, e.target.checked)}
                      aria-label={`Toggle completion for ${task.title}`}
                      className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span
                      className={`text-sm truncate ${
                        task.completed
                          ? "line-through text-slate-400 dark:text-zinc-500"
                          : "text-slate-900 dark:text-zinc-100 font-medium"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                      {formatRelativeDate(task.createdAt)}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                        task.priority === "high"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          : task.priority === "medium"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                      }`}
                    >
                      {task.priority}
                    </span>
                    {onEditTask && (
                      <button
                        type="button"
                        onClick={() => onEditTask(task)}
                        aria-label={`Edit ${task.title}`}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
