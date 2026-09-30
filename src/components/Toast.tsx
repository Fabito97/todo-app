"use client";

import React, { useEffect } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error";
  text: string;
  durationMs?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  useEffect(() => {
    const timers = toasts.map((t) => {
      const duration = t.durationMs ?? 3000;
      return setTimeout(() => {
        onDismiss(t.id);
      }, duration);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-[#2e3340] rounded-xl px-4 py-3 shadow-lg text-sm flex items-center justify-between gap-3 text-slate-800 dark:text-zinc-100 ${
            toast.type === "success"
              ? "border-l-4 border-l-emerald-500"
              : "border-l-4 border-l-rose-500"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? (
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-emerald-500 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-rose-500 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium text-xs sm:text-sm">{toast.text}</span>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer p-0.5"
          >
            <svg
              aria-hidden="true"
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
