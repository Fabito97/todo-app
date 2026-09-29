import { test, expect } from "@playwright/test";

test.describe("Todo App - Add and List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("can add a todo and it persists after reload", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    const addButton = page.getByRole("button", { name: /add todo/i });

    await input.fill("Playwright Test Todo");
    await addButton.click();

    // Verify it appears in list
    const todoItem = page.getByText("Playwright Test Todo");
    await expect(todoItem).toBeVisible();

    // Verify input clears
    await expect(input).toHaveValue("");

    // Reload page
    await page.reload();

    // Verify persisted
    await expect(page.getByText("Playwright Test Todo")).toBeVisible();
  });
});
