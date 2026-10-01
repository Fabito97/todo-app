"use client";

import React, { useEffect } from "react";
import { LayoutDashboard, CheckSquare, Calendar, Check, X, Bell } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Todo } from "@/lib/schemas";
import { getReminders } from "./NotificationCenter";

export type WorkspaceView = "dashboard" | "tasks" | "calendar";

interface SidebarNavProps {
  activeView: WorkspaceView;
  onSelectView: (view: WorkspaceView) => void;
  taskCount?: number;
  todos?: Todo[];
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onOpenNotifications?: () => void;
}

export function SidebarNav({
  activeView,
  onSelectView,
  taskCount,
  todos = [],
  isMobile = false,
  isOpen = false,
  onClose,
  onOpenNotifications,
}: SidebarNavProps) {
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, isOpen, onClose]);

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

  const notificationCount = getReminders(todos).length;

  const content = (
    <>
      <div className="space-y-6">
        {/* App Brand / Logo */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-sm">
              <Check aria-hidden="true" className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Todo Workspace
              </h2>
              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Win your day back
              </span>
            </div>
          </div>
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-[#22262f] transition cursor-pointer"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links (Top level) */}
        <nav aria-label={isMobile ? "Mobile navigation" : "Main navigation"}>
          <ul className="space-y-1 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectView(item.id);
                      if (isMobile) onClose?.();
                    }}
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

      {/* Bottom Level: Notifications & Themes */}
      <div className="pt-4 border-t border-slate-200 dark:border-[#2e3340] space-y-3">
        {/* Notifications item */}
        {isMobile && onOpenNotifications && (
          <button
            type="button"
            onClick={() => {
              onClose?.();
              onOpenNotifications();
            }}
            aria-label="Open notifications"
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition text-left cursor-pointer text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#22262f] hover:text-slate-900 dark:hover:text-zinc-100"
          >
            <div className="flex items-center gap-3">
              <Bell aria-hidden="true" className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium">Notifications</span>
            </div>
            {notificationCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {notificationCount}
              </span>
            )}
          </button>
        )}

        {/* Theme Switcher & Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-1">
            <span>Appearance</span>
            <span className="text-[10px] font-mono">Warm Graphite</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="lg:hidden">
        {/* Backdrop Overlay */}
        <div
          className={`fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity duration-300 ${
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Slide-out Drawer */}
        <aside
          aria-label="Sidebar navigation drawer"
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col justify-between bg-white dark:bg-[#161920] border-r border-slate-200 dark:border-[#2e3340] h-full p-4 select-none shadow-2xl transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          }`}
        >
          {content}
        </aside>
      </div>
    );
  }

  return (
    <aside
      aria-label="Sidebar"
      className="w-60 flex-none flex flex-col justify-between bg-slate-100 dark:bg-[#161920] border-r border-slate-200 dark:border-[#2e3340] h-full p-4 select-none"
    >
      {content}
    </aside>
  );
}

