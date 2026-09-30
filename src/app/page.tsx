"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/use-todos";
import { SidebarNav, WorkspaceView } from "@/components/SidebarNav";
import { ContentHeader } from "@/components/ContentHeader";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoList } from "@/components/TodoList";
import { FilterBar } from "@/components/FilterBar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { CalendarScheduleView } from "@/components/CalendarScheduleView";

export default function Home() {
  const [activeView, setActiveView] = useState<WorkspaceView>("dashboard");

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
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#121316]">
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden lg:flex h-full flex-none">
        <SidebarNav activeView={activeView} onSelectView={setActiveView} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Content Top Header */}
        <ContentHeader
          activeView={activeView}
          onOpenNewTask={() => {
            // In Slice 03, this opens AddTaskModal
            if (activeView !== "dashboard") {
              setActiveView("dashboard");
            }
          }}
          todos={allTodos}
        />

        {/* Dynamic View Content */}
        <div className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 space-y-6">
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

          {activeView === "dashboard" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Today's Dashboard & Progress Summary */}
              <DashboardOverview todos={allTodos} onToggle={toggleTodo} />

              {/* Quick Task Creation Section */}
              <section
                aria-label="Create task"
                className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-4 sm:p-5 shadow-md shadow-slate-200/40 dark:shadow-black/40"
              >
                <AddTodoForm onAdd={addTodo} />
              </section>
            </div>
          )}

          {activeView === "tasks" && (
            <section
              aria-label="Task list board"
              className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-6 shadow-md shadow-slate-200/40 dark:shadow-black/40 space-y-6 max-w-5xl mx-auto"
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

          {activeView === "calendar" && (
            <div className="max-w-5xl mx-auto">
              <CalendarScheduleView todos={allTodos} onToggle={toggleTodo} />
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden h-14 flex items-center justify-around border-t border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#1a1d24] flex-none px-4 select-none"
        >
          <button
            type="button"
            onClick={() => setActiveView("dashboard")}
            aria-current={activeView === "dashboard" ? "page" : undefined}
            className={`flex-1 min-h-[44px] flex flex-col items-center justify-center text-xs font-semibold cursor-pointer transition-colors ${
              activeView === "dashboard"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            }`}
          >
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("tasks")}
            aria-current={activeView === "tasks" ? "page" : undefined}
            className={`flex-1 min-h-[44px] flex flex-col items-center justify-center text-xs font-semibold cursor-pointer transition-colors ${
              activeView === "tasks"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            }`}
          >
            <span>Tasks</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("calendar")}
            aria-current={activeView === "calendar" ? "page" : undefined}
            className={`flex-1 min-h-[44px] flex flex-col items-center justify-center text-xs font-semibold cursor-pointer transition-colors ${
              activeView === "calendar"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            }`}
          >
            <span>Calendar</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
