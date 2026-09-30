"use client";

import React from "react";
import { LayoutDashboard, CheckSquare, Calendar, Check } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export type WorkspaceView = "dashboard" | "tasks" | "calendar";

interface SidebarNavProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
}

export function SidebarNav({ activeView, onSelectView }: SidebarNavProps) {
  const navItems: { id: WorkspaceView; label: string; icon: React.ReactNode }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard aria-hidden="true" className="w-5 h-5 shrink-0" />,
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: <CheckSquare aria-hidden="true" className="w-5 h-5 shrink-0" />,
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: <Calendar aria-hidden="true" className="w-5 h-5 shrink-0" />,
    },
  ];

  return (
    <aside
      aria-label="Main navigation"
      className="w-60 flex-none flex flex-col bg-slate-100 dark:bg-[#161920] border-r border-slate-200 dark:border-[#2e3340] h-full p-4 select-none"
    >
      {/* Brand logo & workspace title */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          <Check aria-hidden="true" className="w-4 h-4 stroke-[3]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 leading-tight">
            Task Workspace
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Professional</p>
        </div>
      </div>

      {/* Nav List */}
      <nav aria-label="Main navigation links" className="flex-1">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs dark:bg-indigo-700"
                      : "text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#22262f] hover:text-slate-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Anchored Theme Toggle */}
      <div className="mt-auto pt-4 pb-4 border-t border-slate-200 dark:border-[#2e3340] flex flex-col gap-2 relative z-10">
        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 px-1">
          Theme
        </p>
        <ThemeToggle />
      </div>
    </aside>
  );
}
