import { test, expect } from "@playwright/test";

test.describe.serial("Todo App", () => {
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

  test("can add rich todo with details and it persists after reload", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    const toggleDetails = page.getByRole("button", { name: /toggle details/i });
    const addButton = page.getByRole("button", { name: /add todo/i });

    await input.fill("Rich Todo Item");
    await toggleDetails.click();

    const descInput = page.getByRole("textbox", { name: /description/i });
    const priorityGroup = page.getByRole("group", { name: "Priority", exact: true });
    const highPriorityBtn = priorityGroup.getByRole("button", { name: /priority high/i });
    const dueDateInput = page.getByLabel(/due date/i);
    const categoryInput = page.getByRole("textbox", { name: /category/i });

    await descInput.fill("Important deployment checklist");
    await highPriorityBtn.click();
    await dueDateInput.fill("2026-11-15");
    await categoryInput.fill("DevOps");

    await addButton.click();

    await expect(page.getByText("Rich Todo Item")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Rich Todo Item")).toBeVisible();
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

  test("can edit rich todo details and it persists after reload", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    await input.fill("Editable Todo");
    await page.getByRole("button", { name: /add todo/i }).click();

    const editBtn = page.getByRole("button", { name: /edit editable todo/i });
    await editBtn.click();

    const editInput = page.getByRole("textbox", { name: /edit todo title/i });
    await editInput.fill("Editable Todo Updated");

    const highPriorityBtn = page.getByRole("group", { name: /edit priority/i }).getByRole("button", { name: /priority high/i });
    await highPriorityBtn.click();

    const categoryInput = page.getByRole("textbox", { name: /edit category/i });
    await categoryInput.fill("Chores");

    const saveBtn = page.getByRole("button", { name: /save changes/i });
    await saveBtn.click();

    const item = page.getByRole("listitem");
    await expect(item.getByText("Editable Todo Updated")).toBeVisible();
    await expect(item.getByText("Chores")).toBeVisible();
    await expect(item.getByText("high")).toBeVisible();

    await page.reload();
    const reloadedItem = page.getByRole("listitem");
    await expect(reloadedItem.getByText("Editable Todo Updated")).toBeVisible();
    await expect(reloadedItem.getByText("Chores")).toBeVisible();
    await expect(reloadedItem.getByText("high")).toBeVisible();
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

  test("filters by priority, category, and sorts by dueDate and priority", async ({ page }) => {
    const titleInput = page.getByRole("textbox", { name: /todo title/i });
    const toggleDetails = page.getByRole("button", { name: /toggle details/i });
    const addButton = page.getByRole("button", { name: /add todo/i });
    const formPriorityGroup = page.getByRole("group", { name: "Priority", exact: true });

    // Item 1: Work Urgent
    await titleInput.fill("Work Urgent Item");
    await toggleDetails.click();
    await formPriorityGroup.getByRole("button", { name: /priority high/i }).click();
    await page.getByLabel(/due date/i).fill("2026-12-01");
    await page.getByRole("textbox", { name: /category/i }).fill("Work");
    await addButton.click();

    // Item 2: Personal Low
    await titleInput.fill("Personal Low Item");
    await formPriorityGroup.getByRole("button", { name: /priority low/i }).click();
    await page.getByLabel(/due date/i).fill("2026-10-15");
    await page.getByRole("textbox", { name: /category/i }).fill("Personal");
    await addButton.click();

    // Item 3: Work Standard
    await titleInput.fill("Work Standard Item");
    await formPriorityGroup.getByRole("button", { name: /priority med/i }).click();
    await page.getByLabel(/due date/i).fill("2026-11-20");
    await page.getByRole("textbox", { name: /category/i }).fill("Work");
    await addButton.click();

    await expect(page.getByText("Work Urgent Item")).toBeVisible();
    await expect(page.getByText("Personal Low Item")).toBeVisible();
    await expect(page.getByText("Work Standard Item")).toBeVisible();

    // Filter by priority high
    const priorityGroup = page.getByRole("group", { name: /filter by priority/i });
    await priorityGroup.getByRole("button", { name: /priority high/i }).click();

    await expect(page.getByText("Work Urgent Item")).toBeVisible();
    await expect(page.getByText("Personal Low Item")).not.toBeVisible();
    await expect(page.getByText("Work Standard Item")).not.toBeVisible();

    // Reset priority to All
    await priorityGroup.getByRole("button", { name: /priority all/i }).click();
    await expect(page.getByText("Personal Low Item")).toBeVisible();

    // Filter by category Work
    const categorySelect = page.getByRole("combobox", { name: /filter by category/i });
    await categorySelect.selectOption("Work");
    await expect(page.getByText("Work Urgent Item")).toBeVisible();
    await expect(page.getByText("Work Standard Item")).toBeVisible();
    await expect(page.getByText("Personal Low Item")).not.toBeVisible();

    // Reset category to All
    await categorySelect.selectOption("all");
    await expect(page.getByText("Personal Low Item")).toBeVisible();

    // Sort by Due Date: 2026-10-15 (Personal Low Item) should appear first
    const sortSelect = page.getByRole("combobox", { name: /sort todos by/i });
    await sortSelect.selectOption("dueDate");

    const items = page.getByRole("listitem");
    await expect(items.nth(0)).toContainText("Personal Low Item");
    await expect(items.nth(1)).toContainText("Work Standard Item");
    await expect(items.nth(2)).toContainText("Work Urgent Item");

    // Sort by Priority: high (Work Urgent) -> medium (Work Standard) -> low (Personal Low)
    await sortSelect.selectOption("priority");
    await expect(items.nth(0)).toContainText("Work Urgent Item");
    await expect(items.nth(1)).toContainText("Work Standard Item");
    await expect(items.nth(2)).toContainText("Personal Low Item");
  });

  test("persists theme toggle across reload, updates completion progress bar, and resets active filters", async ({ page }) => {
    // 1. Toggle dark theme and verify persistence after reload
    const darkThemeBtn = page.getByRole("button", { name: /dark theme/i });
    await darkThemeBtn.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Switch back to light theme
    const lightThemeBtn = page.getByRole("button", { name: /light theme/i });
    await lightThemeBtn.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    // 2. Verify progress bar updates when adding and completing tasks
    const progressbar = page.getByRole("progressbar");
    await expect(progressbar).toHaveAttribute("aria-valuenow", "0");

    const titleInput = page.getByRole("textbox", { name: /todo title/i });
    const addButton = page.getByRole("button", { name: /add todo/i });

    await titleInput.fill("Dashboard Task 1");
    await addButton.click();
    await titleInput.fill("Dashboard Task 2");
    await addButton.click();

    await page.getByRole("checkbox", { name: /toggle completion for dashboard task 1/i }).click();
    await expect(progressbar).toHaveAttribute("aria-valuenow", "50");

    // 3. Filter to Completed and use Reset filters button to restore all tasks
    await page.getByRole("button", { name: /^completed/i }).click();
    await expect(page.getByText("Dashboard Task 2")).not.toBeVisible();

    const resetBtn = page.getByRole("button", { name: /reset filters/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    await expect(page.getByText("Dashboard Task 1")).toBeVisible();
    await expect(page.getByText("Dashboard Task 2")).toBeVisible();
  });
});


