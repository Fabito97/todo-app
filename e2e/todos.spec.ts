import { test, expect } from "@playwright/test";

test.describe("Todo App", () => {
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

    await expect(page.getByText("Playwright Test Todo")).toBeVisible();
    await expect(input).toHaveValue("");

    await page.reload();
    await expect(page.getByText("Playwright Test Todo")).toBeVisible();
  });

  test("can toggle todo completion and it persists after reload", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    await input.fill("Toggle Me");
    await page.getByRole("button", { name: /add todo/i }).click();

    const checkbox = page.getByRole("checkbox", { name: /toggle completion for toggle me/i });
    await expect(checkbox).not.toBeChecked();

    await checkbox.click();
    await expect(checkbox).toBeChecked();

    await page.reload();
    const reloadedCheckbox = page.getByRole("checkbox", { name: /toggle completion for toggle me/i });
    await expect(reloadedCheckbox).toBeChecked();
  });

  test("can edit a todo title and it persists after reload", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    await input.fill("Original Title");
    await page.getByRole("button", { name: /add todo/i }).click();

    const editBtn = page.getByRole("button", { name: /edit original title/i });
    await editBtn.click();

    const editInput = page.getByRole("textbox", { name: /edit todo title/i });
    await editInput.fill("Edited Title");
    await editInput.press("Enter");

    await expect(page.getByText("Edited Title")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Edited Title")).toBeVisible();
  });

  test("can delete a todo permanently", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    await input.fill("Delete Me Soon");
    await page.getByRole("button", { name: /add todo/i }).click();

    await expect(page.getByText("Delete Me Soon")).toBeVisible();

    const deleteBtn = page.getByRole("button", { name: /delete delete me soon/i });
    await deleteBtn.click();

    await expect(page.getByText("Delete Me Soon")).not.toBeVisible();

    await page.reload();
    await expect(page.getByText("Delete Me Soon")).not.toBeVisible();
  });

  test("filters list by all, active, and completed and updates active counter", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    const addButton = page.getByRole("button", { name: /add todo/i });

    await input.fill("Task 1 Active");
    await addButton.click();

    await input.fill("Task 2 Completed");
    await addButton.click();

    // Toggle Task 2 to completed
    const task2Checkbox = page.getByRole("checkbox", { name: /toggle completion for task 2 completed/i });
    await task2Checkbox.click();

    // Check counter
    await expect(page.getByText("1 item left")).toBeVisible();

    // Switch to Active filter
    const activeFilterBtn = page.getByRole("button", { name: /^active/i });
    await activeFilterBtn.click();

    await expect(page.getByText("Task 1 Active")).toBeVisible();
    await expect(page.getByText("Task 2 Completed")).not.toBeVisible();

    // Switch to Completed filter
    const completedFilterBtn = page.getByRole("button", { name: /^completed/i });
    await completedFilterBtn.click();

    await expect(page.getByText("Task 1 Active")).not.toBeVisible();
    await expect(page.getByText("Task 2 Completed")).toBeVisible();

    // Switch back to All filter
    const allFilterBtn = page.getByRole("button", { name: /^all/i });
    await allFilterBtn.click();

    await expect(page.getByText("Task 1 Active")).toBeVisible();
    await expect(page.getByText("Task 2 Completed")).toBeVisible();
  });

  test("full happy path with zero console errors and mobile usability at 375px", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Set mobile viewport 375px
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check no horizontal scrollbar
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    const input = page.getByRole("textbox", { name: /todo title/i });
    const addButton = page.getByRole("button", { name: /add todo/i });

    // 1. Add
    await input.fill("Master Full Flow");
    await addButton.click();
    await expect(page.getByText("Master Full Flow")).toBeVisible();

    // 2. Edit
    const editBtn = page.getByRole("button", { name: /edit master full flow/i });
    await editBtn.click();
    const editInput = page.getByRole("textbox", { name: /edit todo title/i });
    await editInput.fill("Master Full Flow Updated");
    await editInput.press("Enter");
    await expect(page.getByText("Master Full Flow Updated")).toBeVisible();

    // 3. Toggle
    const checkbox = page.getByRole("checkbox", { name: /toggle completion for master full flow updated/i });
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // 4. Filter
    const activeFilterBtn = page.getByRole("button", { name: /^active/i });
    await activeFilterBtn.click();
    await expect(page.getByText("No active todos")).toBeVisible();

    const completedFilterBtn = page.getByRole("button", { name: /^completed/i });
    await completedFilterBtn.click();
    await expect(page.getByText("Master Full Flow Updated")).toBeVisible();

    // 5. Delete
    const deleteBtn = page.getByRole("button", { name: /delete master full flow updated/i });
    await deleteBtn.click();
    await expect(page.getByText("No completed todos")).toBeVisible();

    // 6. Assert zero unhandled console errors
    expect(consoleErrors).toEqual([]);
  });
});

