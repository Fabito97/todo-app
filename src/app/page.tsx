"use client";

import { useTodos } from "@/hooks/use-todos";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoList } from "@/components/TodoList";
import { FilterBar } from "@/components/FilterBar";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
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

  const totalCount = allTodos.length;
  const completedCount = totalCount - activeCount;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40 dark:from-slate-900 dark:via-slate-800/95 dark:to-indigo-950/40 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-slate-100 dark:to-indigo-400 bg-clip-text text-transparent">
              Todo List
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Organize your day with local storage simplicity
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <ThemeToggle />
          </div>
        </header>

        {/* Dashboard Progress & Stat Summary */}
        <section
          aria-label="Task progress summary"
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-md shadow-slate-200/40 dark:shadow-slate-950/40 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-600/80">
                Total: <strong className="font-semibold">{totalCount}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                Active: <strong className="font-semibold">{activeCount}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                Completed: <strong className="font-semibold">{completedCount}</strong>
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {completionPercentage}% done
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Task completion progress"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700/80 overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </section>

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

        <section className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 space-y-6">
          <AddTodoForm onAdd={addTodo} />

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300"
            >
              {error}
            </div>
          )}

          <div className="pt-2">
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
      </div>
    </main>
  );
}
