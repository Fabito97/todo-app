import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Toast, ToastMessage } from "@/components/Toast";

describe("Toast component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders toast message with accessible role='status' and aria-live='polite'", () => {
    const toasts: ToastMessage[] = [
      { id: "1", type: "success", text: "Task added" },
    ];

    render(<Toast toasts={toasts} onDismiss={vi.fn()} />);

    const container = screen.getByRole("status");
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Task added")).toBeInTheDocument();
  });

  it("auto-dismisses a toast after duration", () => {
    const handleDismiss = vi.fn();
    const toasts: ToastMessage[] = [
      { id: "1", type: "success", text: "Task added", durationMs: 3000 },
    ];

    render(<Toast toasts={toasts} onDismiss={handleDismiss} />);

    expect(screen.getByText("Task added")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(handleDismiss).toHaveBeenCalledWith("1");
  });
});
