"use client";

import React from "react";

export type MetricAccent = "total" | "active" | "completed" | "critical";

interface MetricCardProps {
  label: string;
  value: number;
  sublabel?: string;
  progress?: number;
  accent?: MetricAccent;
}

export function MetricCard({
  label,
  value,
  sublabel,
  progress,
  accent = "total",
}: MetricCardProps) {
  const accentClasses: Record<MetricAccent, string> = {
    total: "text-slate-700 dark:text-zinc-300",
    active: "text-indigo-600 dark:text-indigo-400",
    completed: "text-emerald-600 dark:text-emerald-400",
    critical: "text-rose-600 dark:text-rose-400",
  };

  return (
    <section
      aria-label={`${label} metric`}
      className="bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-2xl p-5 shadow-md flex flex-col justify-between min-h-[120px]"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
          {label}
        </p>
        <p
          className={`text-4xl font-extrabold tracking-tight mt-1 ${
            accentClasses[accent]
          }`}
        >
          {value}
        </p>
      </div>

      <div className="mt-3">
        {progress !== undefined ? (
          <div className="space-y-1.5">
            <div
              role="progressbar"
              aria-label="Completion progress"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-[#22262f] overflow-hidden"
            >
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              {progress}% complete
            </p>
          </div>
        ) : sublabel ? (
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            {sublabel}
          </p>
        ) : null}
      </div>
    </section>
  );
}
