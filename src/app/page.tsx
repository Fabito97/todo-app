"use client";

import { useTodos } from "@/hooks/use-todos";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoList } from "@/components/TodoList";

export default function Home() {
  const { todos, loading, error, addTodo, toggleTodo, editTodo, deleteTodo } =
    useTodos();

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
              onToggle={toggleTodo}
              onEdit={editTodo}
              onDelete={deleteTodo}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
