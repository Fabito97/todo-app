"use client";

import { useTodos } from "@/hooks/use-todos";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoList } from "@/components/TodoList";
import { FilterBar } from "@/components/FilterBar";

export default function Home() {
  const {
    todos,
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
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-zinc-100 to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-indigo-600 dark:from-white dark:via-zinc-200 dark:to-indigo-400 bg-clip-text text-transparent">
            Todo List
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Organize your day with local storage simplicity
          </p>
        </header>

        {storageNotice && (
          <div
            role="status"
            className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 text-xs font-medium text-amber-900 dark:text-amber-200 shadow-sm flex items-start gap-3"
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

        <section className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xl shadow-zinc-200/50 dark:shadow-none space-y-6">
          <AddTodoForm onAdd={addTodo} />

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400"
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
