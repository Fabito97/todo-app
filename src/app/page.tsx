"use client";

import { useState } from "react";
import { useTodos } from "@/hooks/use-todos";
import { SidebarNav, WorkspaceView } from "@/components/SidebarNav";
import { ContentHeader } from "@/components/ContentHeader";
import { DashboardView } from "@/components/DashboardView";
import { TasksView } from "@/components/TasksView";
import { CalendarScheduleView } from "@/components/CalendarScheduleView";
import { Toast, ToastMessage } from "@/components/Toast";
import { AddTaskModal } from "@/components/AddTaskModal";
import { TaskDetailsModal } from "@/components/TaskDetailsModal";
import { EditTaskModal } from "@/components/EditTaskModal";
import { Todo } from "@/lib/schemas";

export default function Home() {
  const [activeView, setActiveView] = useState<WorkspaceView>("dashboard");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal States
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const addToast = (type: "success" | "error", text: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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

  const handleQuickAdd = async (title: string) => {
    await addTodo({ title, priority: "medium" });
    addToast("success", "Task added");
  };

  const handleOpenDetails = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDetailsModalOpen(true);
  };

  const handleOpenEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsEditTaskModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
    addToast("success", "Task deleted");
  };

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
          onOpenNewTask={() => setIsAddTaskModalOpen(true)}
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
            <DashboardView
              todos={allTodos}
              onQuickAdd={handleQuickAdd}
              onToggle={toggleTodo}
              onEditTask={handleOpenEdit}
            />
          )}

          {activeView === "tasks" && (
            <TasksView
              todos={todos}
              totalCount={allTodos.length}
              activeCount={activeCount}
              loading={loading}
              error={error}
              filter={filter}
              onFilterChange={setFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              categories={categories}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onToggle={toggleTodo}
              onOpenEdit={handleOpenEdit}
              onOpenDetails={handleOpenDetails}
              onDelete={handleDelete}
              onOpenNewTask={() => setIsAddTaskModalOpen(true)}
            />
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

      {/* Floating Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAdd={async (input) => {
          await addTodo(input);
          addToast("success", "Task added");
        }}
      />

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        todo={selectedTodo}
        onClose={() => setIsDetailsModalOpen(false)}
        onToggle={toggleTodo}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        todo={selectedTodo}
        onClose={() => setIsEditTaskModalOpen(false)}
        onSave={async (id, updates) => {
          await editTodo(id, updates);
          addToast("success", "Task updated");
        }}
      />
    </div>
  );
}
