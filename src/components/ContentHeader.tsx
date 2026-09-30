"use client";

import { Plus } from "lucide-react";
import { Todo } from "@/lib/schemas";
import { NotificationCenter } from "./NotificationCenter";
import { ThemeToggle } from "./ThemeToggle";
import { WorkspaceView } from "./SidebarNav";

interface ContentHeaderProps {
  activeView: WorkspaceView;
  onOpenNewTask?: () => void;
  todos: Todo[];
}

export function ContentHeader({
  activeView,
  onOpenNewTask,
  todos,
}: ContentHeaderProps) {
  const titles: Record<WorkspaceView, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Your executive task overview",
    },
    tasks: {
      title: "Tasks",
      subtitle: "Manage and filter all your tasks",
    },
    calendar: {
      title: "Calendar",
      subtitle: "Browse by month and plan your schedule",
    },
  };

  const { title, subtitle } = titles[activeView];

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#1a1d24] flex-none">
      {/* View Title & Subtitle */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
          {subtitle}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Primary CTA + New Task */}
        <button
          type="button"
          onClick={onOpenNewTask}
          aria-label="Open new task modal"
          className="min-h-[40px] flex items-center gap-2 py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Plus aria-hidden="true" className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>+ New Task</span>
        </button>

        {/* Notification Center */}
        <NotificationCenter todos={todos} />

        {/* Mobile-only Theme Toggle */}
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
