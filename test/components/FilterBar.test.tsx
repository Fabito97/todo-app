import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FilterBar } from "@/components/FilterBar";

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

  it("renders priority filter chips and calls onPriorityFilterChange", async () => {
    const onPriorityFilterChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterBar
        activeCount={3}
        currentFilter="all"
        priorityFilter="high"
        onFilterChange={vi.fn()}
        onPriorityFilterChange={onPriorityFilterChange}
      />
    );

    const highPriorityChip = screen.getByRole("button", { name: /priority high/i });
    expect(highPriorityChip).toHaveAttribute("aria-pressed", "true");

    const lowPriorityChip = screen.getByRole("button", { name: /priority low/i });
    expect(lowPriorityChip).toHaveAttribute("aria-pressed", "false");

    await user.click(lowPriorityChip);
    expect(onPriorityFilterChange).toHaveBeenCalledWith("low");
  });

  it("renders category selector and calls onCategoryFilterChange", async () => {
    const onCategoryFilterChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterBar
        activeCount={3}
        currentFilter="all"
        categoryFilter="Work"
        categories={["Work", "Personal", "Health"]}
        onFilterChange={vi.fn()}
        onCategoryFilterChange={onCategoryFilterChange}
      />
    );

    const categorySelect = screen.getByRole("combobox", { name: /filter by category/i });
    expect(categorySelect).toHaveValue("Work");

    await user.selectOptions(categorySelect, "Health");
    expect(onCategoryFilterChange).toHaveBeenCalledWith("Health");
  });

  it("renders sort selector and calls onSortChange", async () => {
    const onSortChange = vi.fn();
    const user = userEvent.setup();

    render(
      <FilterBar
        activeCount={3}
        currentFilter="all"
        sortBy="newest"
        onFilterChange={vi.fn()}
        onSortChange={onSortChange}
      />
    );

    const sortSelect = screen.getByRole("combobox", { name: /sort todos by/i });
    expect(sortSelect).toHaveValue("newest");

    await user.selectOptions(sortSelect, "dueDate");
    expect(onSortChange).toHaveBeenCalledWith("dueDate");
  });
});
