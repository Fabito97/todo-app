"use client";

import React, { useState } from "react";
import { ClipboardList, Zap, CheckCircle2, Flame, Clock, Plus, Loader2 } from "lucide-react";
import { Todo } from "@/lib/schemas";
import { formatShortDate, isOverdue, formatOverdueLabel } from "@/lib/date-utils";
import { MetricCard } from "./MetricCard";
import { TodoItem } from "./TodoItem";

interface DashboardViewProps {
  todos: Todo[];
  onQuickAdd: (title: string) => Promise<void>;
  onToggle: (id: string, completed: boolean) => Promise<unknown>;
  onEditTask?: (todo: Todo) => void;
  onOpenDetails?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
}

export function DashboardView({
  todos,
  onQuickAdd,
  onToggle,
  onEditTask,
  onOpenDetails,
  onDelete,
}: DashboardViewProps) {
  const [quickTitle, setQuickTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  const todayFormatted = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      if (!isNaN(timeA) && !isNaN(timeB) && timeB !== timeA) {
        return timeB - timeA;
      }
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    })
    .slice(0, 5);

  const formatRelativeDate = (isoStr: string) => {
    if (!isoStr) return "";
    const createdDate = isoStr.slice(0, 10);
    if (createdDate === todayStr) return "Today";
    if (createdDate === yesterdayStr) return "Yesterday";
    return formatShortDate(createdDate);
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

  const handleRecentToggle = async (id: string, completed: boolean) => {
    setTogglingId(id);
    try {
      await onToggle(id, completed);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-10 pb-20">
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

      {/* Two Column Dashboard Layout: Today's Tasks + (Critical & Recent) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Today's Tasks */}
        <section
          aria-label="Today's tasks"
          className="lg:col-span-7 bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Today&apos;s Tasks
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{todayFormatted}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
              {todayTasks.length} scheduled
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-8 text-center">
              No tasks due today. Plan your day by adding a due date.
            </p>
          ) : (
            <ul className="space-y-3">
              {todayTasks.map((task) => (
                <TodoItem
                  key={task.id}
                  todo={task}
                  onToggle={onToggle}
                  onOpenEdit={onEditTask}
                  onOpenDetails={onOpenDetails}
                  onDelete={onDelete || (() => {})}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Right Column (5 cols): Important / Critical & Recent */}
        <div className="lg:col-span-5 space-y-6">
          {/* Important / Critical Tasks Panel */}
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
          <section
            aria-label="Important and critical tasks"
            className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Flame aria-hidden="true" className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Important / Critical</span>
              </h3>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                {criticalTasks.length} pending
              </span>
            </div>

            {criticalTasks.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
                No critical tasks. Great job!
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {criticalTasks.map((task) => (
                  <li
                    key={task.id}
                    onClick={() => onOpenDetails?.(task)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          {isOverdue(task.dueDate, task.completed)
                            ? formatOverdueLabel(task.dueDate)
                            : `Due ${formatShortDate(task.dueDate)}`}
                        </p>
                      )}
                    </div>
                    {onEditTask && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTask(task);
                        }}
                        aria-label={`Edit ${task.title}`}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-[#22262f] text-slate-700 dark:text-zinc-300 hover:text-indigo-600 border border-slate-200 dark:border-[#2e3340] text-[11px] font-medium shrink-0 cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Recent Tasks Panel */}
          <section
            aria-label="Recent tasks"
            className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-5 shadow-sm space-y-3"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock aria-hidden="true" className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>Recent Tasks</span>
            </h3>

            {recentTasks.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
                No tasks yet. Create your first task.
              </p>
            ) : (
              <ul className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-[#2e3340]">
                {recentTasks.map((task) => (
                  <li
                    key={task.id}
                    onClick={() => onOpenDetails?.(task)}
                    className="pt-2 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-[#22262f]/40 p-1.5 rounded-lg transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {togglingId === task.id ? (
                        <span
                          role="status"
                          aria-label={`Updating completion for ${task.title}`}
                          className="w-4 h-4 flex items-center justify-center shrink-0"
                        >
                          <Loader2
                            aria-hidden="true"
                            className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400"
                          />
                        </span>
                      ) : (
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRecentToggle(task.id, e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Toggle completion for ${task.title}`}
                          className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                        />
                      )}
                      <span
                        className={`truncate font-medium ${
                          task.completed
                            ? "line-through text-slate-400 dark:text-zinc-500"
                            : "text-slate-800 dark:text-zinc-200"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                        {formatRelativeDate(task.createdAt)}
                      </span>
                      {onEditTask && (
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          aria-label={`Edit ${task.title}`}
                          className="px-2 py-0.5 rounded bg-white dark:bg-[#22262f] text-slate-600 dark:text-zinc-300 hover:text-indigo-600 border border-slate-200 dark:border-[#2e3340] text-[10px] font-medium cursor-pointer"
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
    </div>
  );
}
