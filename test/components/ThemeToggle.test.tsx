import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { ThemeToggle } from "@/components/ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("renders Light, Dark, and System buttons with System pressed by default", () => {
    render(<ThemeToggle />);

    const lightBtn = screen.getByRole("button", { name: /light theme/i });
    const darkBtn = screen.getByRole("button", { name: /dark theme/i });
    const systemBtn = screen.getByRole("button", { name: /system theme/i });

    expect(lightBtn).toHaveAttribute("aria-pressed", "false");
    expect(darkBtn).toHaveAttribute("aria-pressed", "false");
    expect(systemBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("adds .dark class to documentElement and persists 'dark' in localStorage when Dark is clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const darkBtn = screen.getByRole("button", { name: /dark theme/i });
    await user.click(darkBtn);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme:v1")).toBe("dark");
    expect(darkBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("removes .dark class from documentElement and persists 'light' in localStorage when Light is clicked", async () => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme:v1", "dark");

    const user = userEvent.setup();
    render(<ThemeToggle />);

    const lightBtn = screen.getByRole("button", { name: /light theme/i });
    await user.click(lightBtn);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme:v1")).toBe("light");
    expect(lightBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("initializes theme from stored 'dark' preference", () => {
    localStorage.setItem("theme:v1", "dark");

    render(<ThemeToggle />);

    const darkBtn = screen.getByRole("button", { name: /dark theme/i });
    expect(darkBtn).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
