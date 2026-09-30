"use client";

import React from "react";
import { LayoutDashboard, CheckSquare, Calendar, Check } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export type WorkspaceView = "dashboard" | "tasks" | "calendar";

interface SidebarNavProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  taskCount?: number;
}

export function SidebarNav({ activeView, onSelectView, taskCount }: SidebarNavProps) {
  const navItems: { id: WorkspaceView; label: string; icon: React.ReactNode }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard aria-hidden="true" className="w-4 h-4 shrink-0" />,
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: <CheckSquare aria-hidden="true" className="w-4 h-4 shrink-0" />,
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: <Calendar aria-hidden="true" className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <aside
      aria-label="Sidebar"
      className="w-60 flex-none flex flex-col justify-between bg-slate-100 dark:bg-[#161920] border-r border-slate-200 dark:border-[#2e3340] h-full p-4 select-none"
    >
      <div className="space-y-6">
        {/* App Brand / Logo */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-sm">
            <Check aria-hidden="true" className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Task Workspace
            </h2>
            <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              v1.4 Workspace
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Main navigation">
          <ul className="space-y-1 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectView(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white font-semibold shadow-xs"
                        : "text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#22262f] hover:text-slate-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.id === "tasks" && typeof taskCount === "number" && (
                      <span
                        className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 dark:bg-[#22262f] text-slate-600 dark:text-zinc-400"
                        }`}
                      >
                        {taskCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Bottom Sidebar Section: Theme Switcher & Status */}
      <div className="pt-4 border-t border-slate-200 dark:border-[#2e3340] space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-1">
          <span>Appearance</span>
          <span className="text-[10px] font-mono">Warm Graphite</span>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
