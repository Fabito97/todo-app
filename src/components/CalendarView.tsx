"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit3, Loader2 } from "lucide-react";
import { Todo } from "@/lib/schemas";

interface CalendarViewProps {
  todos: Todo[];
  onToggle: (id: string, completed: boolean) => Promise<unknown> | void;
  onOpenEdit?: (todo: Todo) => void;
  onOpenDetails?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

export function CalendarView({
  todos,
  onToggle,
  onOpenEdit = () => {},
  onOpenDetails = () => {},
}: CalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().slice(0, 10), [today]);

  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());
  const [selectedDate, setSelectedDate] = useState(() => todayStr);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleTaskToggle = async (id: string, completed: boolean) => {
    setTogglingId(id);
    try {
      await onToggle(id, completed);
    } finally {
      setTogglingId(null);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  // Map todos by dueDate for O(1) lookup
  const todosByDate = useMemo(() => {
    const map = new Map<string, Todo[]>();
    for (const todo of todos) {
      if (todo.dueDate) {
        const list = map.get(todo.dueDate) || [];
        list.push(todo);
        map.set(todo.dueDate, list);
      }
    }
    return map;
  }, [todos]);

  // Compute 7-column month grid days
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    interface DayCell {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      tasks: Todo[];
      hasHighPriority: boolean;
    }

    const cells: DayCell[] = [];

    // 1. Leading days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = formatDateKey(prevYear, prevMonth, dayNum);
      const dayTasks = todosByDate.get(dateStr) || [];
      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        tasks: dayTasks,
        hasHighPriority: dayTasks.some((t) => t.priority === "high" && !t.completed),
      });
    }

    // 2. Days in current month
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateStr = formatDateKey(currentYear, currentMonth, day);
      const dayTasks = todosByDate.get(dateStr) || [];
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        tasks: dayTasks,
        hasHighPriority: dayTasks.some((t) => t.priority === "high" && !t.completed),
      });
    }

    // 3. Trailing days from next month to complete 7-day grid rows (35 or 42 cells)
    const totalSlots = Math.ceil(cells.length / 7) * 7;
    const remaining = totalSlots - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = formatDateKey(nextYear, nextMonth, day);
      const dayTasks = todosByDate.get(dateStr) || [];
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        tasks: dayTasks,
        hasHighPriority: dayTasks.some((t) => t.priority === "high" && !t.completed),
      });
    }

    return cells;
  }, [currentYear, currentMonth, selectedDate, todayStr, todosByDate]);

  // Selected date schedule items
  const { timeBlockedTasks, allDayTasks } = useMemo(() => {
    const dayTasks = todosByDate.get(selectedDate) || [];
    const timeBlocked = dayTasks
      .filter((t) => Boolean(t.startTime))
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
    const allDay = dayTasks.filter((t) => !t.startTime);
    return { timeBlockedTasks: timeBlocked, allDayTasks: allDay };
  }, [selectedDate, todosByDate]);

  // Formatted date label for schedule header
  const formattedScheduleDate = useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedDate]);

  const totalScheduledItems = timeBlockedTasks.length + allDayTasks.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 max-w-7xl mx-auto flex-1 min-h-0 pt-10">
      {/* Month Grid Section */}
      <section
        aria-label="Monthly calendar"
        className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-6 shadow-sm flex flex-col space-y-4"
      >
        {/* Month Navigation Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-[#2e3340]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1.5 rounded-xl border border-slate-200 dark:border-[#2e3340] text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#22262f] transition cursor-pointer"
            >
              <ChevronLeft aria-hidden="true" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleJumpToToday}
              aria-label="Jump to today"
              className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1.5 rounded-xl border border-slate-200 dark:border-[#2e3340] text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#22262f] transition cursor-pointer"
            >
              <ChevronRight aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7 Weekday Headers */}
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 py-1">
          {WEEKDAY_NAMES.map((name) => (
            <div key={name}>{name}</div>
          ))}
        </div>

        {/* 7-Column Day Grid */}
        <div className="grid grid-cols-7 gap-1.5 text-xs flex-1">
          {calendarDays.map((cell) => {
            const isToday = cell.isToday;
            const isSelected = cell.isSelected;
            const isCurrentMonth = cell.isCurrentMonth;

            let cellStyle =
              "min-h-[72px] w-full p-2 rounded-xl text-left flex flex-col justify-between transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ";

            if (isToday) {
              cellStyle += "bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 dark:ring-indigo-300 shadow-sm";
            } else if (isSelected) {
              cellStyle += "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500 dark:ring-indigo-400";
            } else if (!isCurrentMonth) {
              cellStyle += "bg-slate-50/50 dark:bg-[#161920]/40 text-slate-400 dark:text-zinc-600 opacity-60 hover:bg-slate-100 dark:hover:bg-[#22262f]/60";
            } else {
              cellStyle += "border border-slate-100 dark:border-[#2e3340]/60 text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#22262f]";
            }

            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => setSelectedDate(cell.dateStr)}
                aria-label={`${cell.dateStr}; ${cell.tasks.length} tasks`}
                aria-pressed={isSelected}
                className={cellStyle}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs ${isToday ? "font-bold" : "font-medium"}`}>
                    {cell.dayNumber}
                  </span>
                  {isToday && (
                    <span className="text-[9px] uppercase px-1 rounded bg-white/20 font-semibold tracking-wider">
                      Today
                    </span>
                  )}
                </div>

                {/* Task Count Indicator Dots */}
                <div className="flex items-center gap-1 mt-1">
                  {cell.tasks.slice(0, 3).map((task, idx) => {
                    const isHigh = task.priority === "high" && !task.completed;
                    let dotColor = "bg-indigo-400 dark:bg-indigo-300";
                    if (isToday) {
                      dotColor = isHigh ? "bg-rose-300" : "bg-indigo-200";
                    } else if (isHigh) {
                      dotColor = "bg-rose-500 dark:bg-rose-400";
                    }

                    return (
                      <span
                        key={task.id || idx}
                        data-testid={isHigh ? `task-dot-high-${cell.dateStr}` : `task-dot-default-${cell.dateStr}`}
                        className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                      />
                    );
                  })}
                  {cell.tasks.length > 3 && (
                    <span className={`text-[9px] ${isToday ? "text-indigo-100" : "text-slate-400 dark:text-zinc-500"}`}>
                      +{cell.tasks.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Daily Schedule Side Panel */}
      <aside
        aria-label="Daily schedule"
        className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-5 shadow-sm space-y-5 flex flex-col h-full overflow-y-auto"
      >
        <div className="border-b border-slate-100 dark:border-[#2e3340] pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            {formattedScheduleDate}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {totalScheduledItems} {totalScheduledItems === 1 ? "task" : "tasks"} scheduled
          </p>
        </div>

        {totalScheduledItems === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-zinc-500 text-xs">
            <CalendarIcon aria-hidden="true" className="w-8 h-8 mb-2 opacity-50" />
            <p>No tasks scheduled for this date.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Time-Blocked Section */}
            {timeBlockedTasks.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Time-Blocked Tasks
                </span>
                <div className="space-y-2">
                  {timeBlockedTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onOpenDetails?.(task)}
                      className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-1.5 transition hover:border-indigo-300 dark:hover:border-indigo-800 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300">
                          {task.startTime} – {task.endTime || "..."}
                        </span>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {togglingId === task.id ? (
                            <span
                              role="status"
                              aria-label={`Updating completion for ${task.title}`}
                              className="h-4 w-4 flex items-center justify-center shrink-0"
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
                              onChange={(e) => handleTaskToggle(task.id, e.target.checked)}
                              aria-label={`Toggle completion for ${task.title}`}
                              className="h-4 w-4 rounded-md border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          )}
                          {onOpenEdit && (
                            <button
                              type="button"
                              onClick={() => onOpenEdit(task)}
                              aria-label={`Edit ${task.title}`}
                              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                            >
                              <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetails?.(task);
                        }}
                        aria-label={`View details for ${task.title}`}
                        className={`text-xs font-semibold text-left transition text-slate-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer ${
                          task.completed ? "line-through text-slate-400 dark:text-zinc-500" : ""
                        }`}
                      >
                        {task.title}
                      </button>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400">
                        {task.category && <span>{task.category} • </span>}
                        <span className="capitalize">{task.priority} priority</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All-Day / Unscheduled Section */}
            {allDayTasks.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  All-Day / Unscheduled
                </span>
                <div className="space-y-2">
                  {allDayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onOpenDetails?.(task)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#22262f] border border-slate-200 dark:border-[#2e3340] space-y-1.5 transition hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetails?.(task);
                          }}
                          aria-label={`View details for ${task.title}`}
                          className={`text-xs font-semibold text-left transition text-slate-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex-1 truncate ${
                            task.completed ? "line-through text-slate-400 dark:text-zinc-500" : ""
                          }`}
                        >
                          {task.title}
                        </button>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {togglingId === task.id ? (
                            <span
                              role="status"
                              aria-label={`Updating completion for ${task.title}`}
                              className="h-4 w-4 flex items-center justify-center shrink-0"
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
                              onChange={(e) => handleTaskToggle(task.id, e.target.checked)}
                              aria-label={`Toggle completion for ${task.title}`}
                              className="h-4 w-4 rounded-md border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          )}
                          {onOpenEdit && (
                            <button
                              type="button"
                              onClick={() => onOpenEdit(task)}
                              aria-label={`Edit ${task.title}`}
                              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                            >
                              <Edit3 aria-hidden="true" className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400">
                        {task.category && <span>{task.category} • </span>}
                        <span className="capitalize">{task.priority} priority</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
