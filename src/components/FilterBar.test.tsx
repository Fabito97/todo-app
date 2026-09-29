import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FilterBar } from "./FilterBar";

describe("FilterBar", () => {
  it("renders active item count correctly with singular and plural forms", () => {
    const { rerender } = render(
      <FilterBar activeCount={1} currentFilter="all" onFilterChange={vi.fn()} />
    );
    expect(screen.getByText("1 item left")).toBeInTheDocument();

    rerender(
      <FilterBar activeCount={2} currentFilter="all" onFilterChange={vi.fn()} />
    );
    expect(screen.getByText("2 items left")).toBeInTheDocument();

    rerender(
      <FilterBar activeCount={0} currentFilter="all" onFilterChange={vi.fn()} />
    );
    expect(screen.getByText("0 items left")).toBeInTheDocument();
  });

  it("marks current filter with aria-current='page'", () => {
    render(
      <FilterBar activeCount={3} currentFilter="active" onFilterChange={vi.fn()} />
    );

    const activeBtn = screen.getByRole("button", { name: /^active/i });
    expect(activeBtn).toHaveAttribute("aria-current", "page");

    const allBtn = screen.getByRole("button", { name: /^all/i });
    expect(allBtn).not.toHaveAttribute("aria-current");

    const completedBtn = screen.getByRole("button", { name: /^completed/i });
    expect(completedBtn).not.toHaveAttribute("aria-current");
  });

  it("calls onFilterChange when a filter button is clicked", async () => {
    const onFilterChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterBar
        activeCount={2}
        currentFilter="all"
        onFilterChange={onFilterChange}
      />
    );

    const activeBtn = screen.getByRole("button", { name: /^active/i });
    await user.click(activeBtn);
    expect(onFilterChange).toHaveBeenCalledWith("active");

    const completedBtn = screen.getByRole("button", { name: /^completed/i });
    await user.click(completedBtn);
    expect(onFilterChange).toHaveBeenCalledWith("completed");
  });
});
