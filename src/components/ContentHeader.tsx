"use client";

import { Plus, Menu, Check } from "lucide-react";
import { Todo } from "@/lib/schemas";
import { NotificationCenter } from "./NotificationCenter";
import { WorkspaceView } from "./SidebarNav";

interface ContentHeaderProps {
  activeView: WorkspaceView;
  onOpenNewTask?: () => void;
  todos: Todo[];
  onOpenSidebar?: () => void;
}

export function ContentHeader({
  activeView,
  onOpenNewTask,
  todos,
  onOpenSidebar,
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
    <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#1a1d24] flex-none">
      {/* Small Screens Top Bar (< lg) */}
      <div className="flex lg:hidden items-center justify-between w-full">
        {/* Left: Short App Title and compact + New Task button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Check aria-hidden="true" className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              Todo
            </span>
          </div>
        </div>

        {/* Right: Hamburger menu button */}
        <div className="flex justify-center items-center gap-2">

          <button
            type="button"
            onClick={onOpenNewTask}
            aria-label="New task"
            className="w-17 h-7 flex items-center gap-1 justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus aria-hidden="true" className="w-3.5 h-3.5 stroke-[2.5]" />
            New
          </button>
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open navigation menu"
            className="p-2 rounded-xl border border-slate-200 dark:border-[#2e3340] bg-white dark:bg-[#1a1d24] text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#22262f] transition-colors cursor-pointer shadow-xs"
          >
            <Menu aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Top Bar (>= lg) */}
      <div className="hidden lg:flex items-center justify-between w-full">
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
            <span>New Task</span>
          </button>

          {/* Notification Center */}
          <NotificationCenter todos={todos} />
        </div>
      </div>
    </header>
  );
}

