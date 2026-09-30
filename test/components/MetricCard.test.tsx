import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MetricCard } from "@/components/MetricCard";

describe("MetricCard component", () => {
  it("renders label and numeral with accessible section role", () => {
    render(
      <MetricCard
        label="Total Tasks"
        value={12}
        sublabel="58% done"
        accent="total"
      />
    );

    const section = screen.getByRole("region", { name: /total tasks metric/i });
    expect(section).toBeInTheDocument();
    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("58% done")).toBeInTheDocument();
  });

  it("renders a progress bar when progress percentage is provided", () => {
    render(
      <MetricCard
        label="Completed"
        value={7}
        progress={70}
        accent="completed"
      />
    );

    const progressbar = screen.getByRole("progressbar", { name: /completion progress/i });
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "70");
  });
});
