"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/use-todos";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoList } from "@/components/TodoList";
import { FilterBar } from "@/components/FilterBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardOverview } from "@/components/DashboardOverview";
import { CalendarScheduleView } from "@/components/CalendarScheduleView";
import { NotificationCenter } from "@/components/NotificationCenter";

type WorkspaceView = "tasks" | "calendar" | "split";

export default function Home() {
  const [viewMode, setViewMode] = useState<WorkspaceView>("tasks");

  const {
    todos,
    allTodos,
    filter,
    setFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    categories,
    activeCount,
    loading,
    error,
    storageNotice,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
  } = useTodos();

  const hasActiveFilters =
    priorityFilter !== "all" || categoryFilter !== "all";

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#121316] py-12 px-4 sm:px-6 lg:px-8">
      <div className={`${viewMode === "split" ? "max-w-5xl" : "max-w-2xl"} mx-auto space-y-6`}>
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-zinc-100 dark:to-indigo-400 bg-clip-text text-transparent">
              Todo List
            </h1>
            <p className="text-sm text-slate-600 dark:text-zinc-300">
              Plan your tasks, daily schedule, and time blocks
            </p>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2.5">
            <NotificationCenter todos={allTodos} />
            <ThemeToggle />
          </div>
        </header>

        {/* Today's Dashboard & Progress Summary */}
        <DashboardOverview todos={allTodos} onToggle={toggleTodo} />

        {storageNotice && (
          <div
            role="status"
            className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/80 text-xs font-medium text-amber-900 dark:text-amber-200 shadow-sm flex items-start gap-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="leading-relaxed">{storageNotice}</p>
          </div>
        )}

        {/* Demarcated Task Creation Card */}
        <section
          aria-label="Create task"
          className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-4 sm:p-5 shadow-md shadow-slate-200/40 dark:shadow-black/40"
        >
          <AddTodoForm onAdd={addTodo} />
        </section>

        {/* Workspace View Switcher */}
        <div
          role="group"
          aria-label="Workspace view"
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#1a1d24] p-1 shadow-xs"
        >
          <button
            type="button"
            onClick={() => setViewMode("tasks")}
            aria-label="Tasks view"
            aria-pressed={viewMode === "tasks"}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "tasks"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#22262f]"
            }`}
          >
            Tasks
          </button>
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            aria-label="Calendar & Schedule view"
            aria-pressed={viewMode === "calendar"}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "calendar"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#22262f]"
            }`}
          >
            Calendar &amp; Schedule
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            aria-label="Split View"
            aria-pressed={viewMode === "split"}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "split"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#22262f]"
            }`}
          >
            Split View
          </button>
        </div>

        {/* Workspace Content */}
        <div
          className={
            viewMode === "split"
              ? "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
              : "space-y-6"
          }
        >
          {(viewMode === "tasks" || viewMode === "split") && (
            <section
              aria-label="Task list board"
              className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-6 shadow-md shadow-slate-200/40 dark:shadow-black/40 space-y-6"
            >
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300"
                >
                  {error}
                </div>
              )}

              <div>
                <TodoList
                  todos={todos}
                  loading={loading}
                  filter={filter}
                  hasActiveFilters={hasActiveFilters}
                  onToggle={toggleTodo}
                  onEdit={editTodo}
                  onDelete={deleteTodo}
                />
              </div>

              {!loading && (
                <FilterBar
                  activeCount={activeCount}
                  currentFilter={filter}
                  onFilterChange={setFilter}
                  priorityFilter={priorityFilter}
                  onPriorityFilterChange={setPriorityFilter}
                  categoryFilter={categoryFilter}
                  onCategoryFilterChange={setCategoryFilter}
                  categories={categories}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
              )}
            </section>
          )}

          {(viewMode === "calendar" || viewMode === "split") && (
            <CalendarScheduleView todos={allTodos} onToggle={toggleTodo} />
          )}
        </div>
      </div>
    </main>
  );
}
