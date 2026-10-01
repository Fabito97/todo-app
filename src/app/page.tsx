"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTodos } from "@/hooks/use-todos";
import { SidebarNav, WorkspaceView } from "@/components/SidebarNav";
import { ContentHeader } from "@/components/ContentHeader";
import { DashboardView } from "@/components/DashboardView";
import { TasksView } from "@/components/TasksView";
import { CalendarView } from "@/components/CalendarView";
import { Toast, ToastMessage } from "@/components/Toast";
import { AddTaskModal } from "@/components/AddTaskModal";
import { TaskDetailsModal } from "@/components/TaskDetailsModal";
import { EditTaskModal } from "@/components/EditTaskModal";
import { NotificationModal } from "@/components/NotificationCenter";
import { Todo } from "@/lib/schemas";

export default function Home() {
  const [activeView, setActiveView] = useState<WorkspaceView>("dashboard");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Mobile Navigation Drawer and Notification Modal States
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Sync tab with URL search parameter (?tab=tasks, ?tab=calendar, or none for dashboard)
  const handleSelectView = useCallback((view: WorkspaceView) => {
    setActiveView(view);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (view === "tasks" || view === "calendar") {
        url.searchParams.set("tab", view);
      } else {
        url.searchParams.delete("tab");
      }
      const search = url.searchParams.toString();
      const newUrl = url.pathname + (search ? `?${search}` : "") + url.hash;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  useEffect(() => {
    const syncTabFromUrl = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "tasks" || tabParam === "calendar") {
        setActiveView(tabParam);
      } else {
        setActiveView("dashboard");
      }
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

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
    searchTerm,
    setSearchTerm,
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

  const effectiveToasts = useMemo<ToastMessage[]>(() => {
    const list = [...toasts];
    if (error && !toasts.some((t) => t.text === error)) {
      list.push({
        id: "hook-error",
        type: "error",
        text: error,
      });
    }
    return list;
  }, [toasts, error]);

  const handleQuickAdd = async (title: string) => {
    try {
      await addTodo({ title, priority: "medium" });
      addToast("success", "Task added");
    } catch {
      // error toast triggered via useTodos error state
    }
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
    try {
      await deleteTodo(id);
      addToast("success", "Task deleted");
    } catch {
      // error toast triggered via useTodos error state
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#121316]">
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden lg:flex h-full flex-none">
        <SidebarNav
          activeView={activeView}
          onSelectView={handleSelectView}
          taskCount={allTodos.length}
        />
      </div>

      {/* Mobile Slide-Out Drawer Navigation */}
      <SidebarNav
        isMobile
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activeView={activeView}
        onSelectView={(view) => {
          handleSelectView(view);
          setIsMobileSidebarOpen(false);
        }}
        taskCount={allTodos.length}
        todos={allTodos}
        onOpenNotifications={() => {
          setIsMobileSidebarOpen(false);
          setIsNotificationModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Content Top Header */}
        <ContentHeader
          activeView={activeView}
          onOpenNewTask={() => setIsAddTaskModalOpen(true)}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
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
              onOpenDetails={handleOpenDetails}
              onDelete={handleDelete}
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
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
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
            <CalendarView
              todos={allTodos}
              onToggle={toggleTodo}
              onOpenEdit={handleOpenEdit}
              onOpenDetails={handleOpenDetails}
              onDelete={handleDelete}
            />
          )}
        </div>

      </main>

      {/* Mobile Notification Modal Panel */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        todos={allTodos}
      />

      {/* Floating Toast Notification Container */}
      <Toast toasts={effectiveToasts} onDismiss={dismissToast} />

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAdd={async (input) => {
          try {
            await addTodo(input);
            addToast("success", "Task added");
          } catch {
            // error toast triggered via useTodos error state
          }
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
          try {
            await editTodo(id, updates);
            addToast("success", "Task updated");
          } catch {
            // error toast triggered via useTodos error state
          }
        }}
      />
    </div>
  );
}
