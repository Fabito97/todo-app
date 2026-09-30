"use client";

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
      icon: (
        <svg
          aria-hidden="true"
          className="w-5 h-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      ),
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: (
        <svg
          aria-hidden="true"
          className="w-5 h-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: (
        <svg
          aria-hidden="true"
          className="w-5 h-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
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
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
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
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-[#2e3340] flex flex-col gap-2">
        <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 px-1">
          Theme
        </p>
        <ThemeToggle />
      </div>
    </aside>
  );
}
