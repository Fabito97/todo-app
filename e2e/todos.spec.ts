import { test, expect } from "@playwright/test";

test.describe.serial("Todo App", () => {
  test.beforeEach(async ({ page, request }) => {
    const res = await request.get("/api/todos");
    if (res.ok()) {
      const items = (await res.json()) as Array<{ id: string }>;
      for (const item of items) {
        await request.delete(`/api/todos/${item.id}`);
      }
    }
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
    // Open New Task modal
    const newTaskBtn = page.getByRole("button", { name: /open new task modal|\+ new task/i }).first();
    await newTaskBtn.click();

    const dialog = page.getByRole("dialog", { name: /new task/i });
    await expect(dialog).toBeVisible();

    const titleInput = dialog.getByRole("textbox", { name: /title/i });
    const descInput = dialog.getByLabel(/description/i);
    const highPriorityBtn = dialog.getByRole("radio", { name: /high priority/i });
    const dueDateInput = dialog.getByLabel(/due date/i);
    const categorySelect = dialog.getByLabel(/category/i);

    await titleInput.fill("Rich Todo Item");
    await descInput.fill("Important deployment checklist");
    await highPriorityBtn.click();
    await dueDateInput.fill("2026-11-15");
    await categorySelect.selectOption("Work");

    const submitBtn = dialog.getByRole("button", { name: /create task/i });
    await submitBtn.click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByText("Rich Todo Item").first()).toBeVisible();
    await page.reload();
    await expect(page.getByText("Rich Todo Item").first()).toBeVisible();
  });

  test("can toggle todo completion and it persists after reload", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    await input.fill("Toggle Me");
    await page.getByRole("button", { name: /add todo/i }).click();

    const checkbox = page.getByRole("checkbox", { name: /toggle completion for toggle me/i }).first();
    await expect(checkbox).not.toBeChecked();

    await checkbox.click();
    await expect(checkbox).toBeChecked();

    await page.reload();
    const reloadedCheckbox = page.getByRole("checkbox", { name: /toggle completion for toggle me/i }).first();
    await expect(reloadedCheckbox).toBeChecked();
  });

  test("can edit a todo title and it persists after reload", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    await input.fill("Original Title");
    await page.getByRole("button", { name: /add todo/i }).click();

    const editBtn = page.getByRole("button", { name: /edit original title/i }).first();
    await editBtn.click();

    const dialog = page.getByRole("dialog", { name: /edit task/i });
    await expect(dialog).toBeVisible();

    const editInput = dialog.getByRole("textbox", { name: /edit title/i });
    await editInput.fill("Edited Title");
    await dialog.getByRole("button", { name: /save changes/i }).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByText("Edited Title").first()).toBeVisible();

    await page.reload();
    await expect(page.getByText("Edited Title").first()).toBeVisible();
  });

  test("can edit rich todo details and it persists after reload", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    await input.fill("Editable Todo");
    await page.getByRole("button", { name: /add todo/i }).click();

    const editBtn = page.getByRole("button", { name: /edit editable todo/i }).first();
    await editBtn.click();

    const dialog = page.getByRole("dialog", { name: /edit task/i });
    await expect(dialog).toBeVisible();

    const editInput = dialog.getByRole("textbox", { name: /edit title/i });
    await editInput.fill("Editable Todo Updated");

    const highPriorityBtn = dialog.getByRole("radio", { name: /priority high/i });
    await highPriorityBtn.click();

    const categorySelect = dialog.getByLabel(/category/i);
    await categorySelect.selectOption("Work");

    const saveBtn = dialog.getByRole("button", { name: /save changes/i });
    await saveBtn.click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByText("Editable Todo Updated").first()).toBeVisible();
    await expect(page.getByText("Work").first()).toBeVisible();
    await expect(page.getByText("high").first()).toBeVisible();

    await page.reload();
    await expect(page.getByText("Editable Todo Updated").first()).toBeVisible();
    await expect(page.getByText("Work").first()).toBeVisible();
    await expect(page.getByText("high").first()).toBeVisible();
  });

  test("can delete a todo permanently", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    await input.fill("Delete Me Soon");
    await page.getByRole("button", { name: /add todo/i }).click();

    await expect(page.getByText("Delete Me Soon")).toBeVisible();

    // Switch to Tasks view to delete from board
    await page.getByRole("button", { name: /^tasks/i }).first().click();

    const deleteBtn = page.getByRole("button", { name: /delete delete me soon/i });
    await deleteBtn.click();

    const confirmBtn = page.getByRole("button", { name: /confirm delete/i });
    await confirmBtn.click();

    await expect(page.getByText("Delete Me Soon")).not.toBeVisible();

    await page.reload();
    await page.getByRole("button", { name: /^tasks/i }).first().click();
    await expect(page.getByText("Delete Me Soon")).not.toBeVisible();
  });

  test("filters list by all, active, and completed and updates active counter", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    const addButton = page.getByRole("button", { name: /add todo/i });

    await input.fill("Task 1 Active");
    await addButton.click();
    await expect(page.getByText("Task 1 Active")).toBeVisible();
    await expect(input).toHaveValue("");

    await input.fill("Task 2 Completed");
    await addButton.click();
    await expect(page.getByText("Task 2 Completed")).toBeVisible();
    await expect(input).toHaveValue("");

    // Switch to Tasks View for full list and filter bar
    await page.getByRole("button", { name: /^tasks/i }).first().click();

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
    const editBtn = page.getByRole("button", { name: /edit master full flow/i }).first();
    await editBtn.click();
    const dialog = page.getByRole("dialog", { name: /edit task/i });
    const editInput = dialog.getByRole("textbox", { name: /edit title/i });
    await editInput.fill("Master Full Flow Updated");
    await dialog.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText("Master Full Flow Updated").first()).toBeVisible();

    // 3. Toggle
    const checkbox = page.getByRole("checkbox", { name: /toggle completion for master full flow updated/i }).first();
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // 4. Switch to mobile Tasks View
    await page.getByRole("navigation", { name: /mobile navigation/i }).getByRole("button", { name: /tasks/i }).click();

    // 5. Filter
    const activeFilterBtn = page.getByRole("button", { name: /^active/i });
    await activeFilterBtn.click();
    await expect(page.getByText("No active todos")).toBeVisible();

    const completedFilterBtn = page.getByRole("button", { name: /^completed/i });
    await completedFilterBtn.click();
    await expect(page.getByText("Master Full Flow Updated")).toBeVisible();

    // 6. Delete
    const deleteBtn = page.getByRole("button", { name: /delete master full flow updated/i });
    await deleteBtn.click();
    const confirmBtn = page.getByRole("button", { name: /confirm delete/i });
    await confirmBtn.click();
    await expect(page.getByText("No completed todos")).toBeVisible();

    // 7. Assert zero unhandled console errors
    expect(consoleErrors).toEqual([]);
  });

  test("filters by priority, category, and sorts by dueDate and priority", async ({ page }) => {
    // Open New Task modal for Item 1: Work Urgent
    const newTaskBtn = page.getByRole("button", { name: /open new task modal|\+ new task/i }).first();
    await newTaskBtn.click();
    let dialog = page.getByRole("dialog", { name: /new task/i });
    await dialog.getByRole("textbox", { name: /title/i }).fill("Work Urgent Item");
    await dialog.getByRole("radio", { name: /high priority/i }).click();
    await dialog.getByLabel(/due date/i).fill("2026-12-01");
    await dialog.getByLabel(/category/i).selectOption("Work");
    await dialog.getByRole("button", { name: /create task/i }).click();

    // Item 2: Personal Low
    await newTaskBtn.click();
    dialog = page.getByRole("dialog", { name: /new task/i });
    await dialog.getByRole("textbox", { name: /title/i }).fill("Personal Low Item");
    await dialog.getByRole("radio", { name: /low priority/i }).click();
    await dialog.getByLabel(/due date/i).fill("2026-10-15");
    await dialog.getByLabel(/category/i).selectOption("Personal");
    await dialog.getByRole("button", { name: /create task/i }).click();

    // Item 3: Work Standard (medium priority)
    await newTaskBtn.click();
    dialog = page.getByRole("dialog", { name: /new task/i });
    await dialog.getByRole("textbox", { name: /title/i }).fill("Work Standard Item");
    await dialog.getByRole("radio", { name: /medium priority/i }).click();
    await dialog.getByLabel(/due date/i).fill("2026-11-20");
    await dialog.getByLabel(/category/i).selectOption("Work");
    await dialog.getByRole("button", { name: /create task/i }).click();

    // Switch to Tasks view for filtering and sorting
    await page.getByRole("button", { name: /^tasks/i }).first().click();

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

    const board = page.getByRole("region", { name: /task list board/i });
    const items = board.getByRole("listitem");
    await expect(items.nth(0)).toContainText("Personal Low Item");
    await expect(items.nth(1)).toContainText("Work Standard Item");
    await expect(items.nth(2)).toContainText("Work Urgent Item");

    // Sort by Priority: high (Work Urgent) -> medium (Work Standard) -> low (Personal Low)
    await sortSelect.selectOption("priority");
    await expect(items.nth(0)).toContainText("Work Urgent Item");
    await expect(items.nth(1)).toContainText("Work Standard Item");
    await expect(items.nth(2)).toContainText("Personal Low Item");
  });

  test("persists theme toggle across reload with zero-flash Warm Graphite (#121316) dark background, updates completion progress bar, and resets active filters", async ({ page }) => {
    // 1. Toggle dark theme and verify persistence and Warm Graphite background after reload
    const darkThemeBtn = page.getByRole("button", { name: /dark theme/i }).first();
    await darkThemeBtn.click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    const bodyBg = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bodyBg).toBe("rgb(18, 19, 22)");

    // Switch back to light theme
    const lightThemeBtn = page.getByRole("button", { name: /light theme/i }).first();
    await lightThemeBtn.click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    // 2. Verify progress bar updates when adding and completing tasks
    const progressbar = page.getByRole("progressbar");
    await expect(progressbar).toHaveAttribute("aria-valuenow", "0");

    const titleInput = page.getByRole("textbox", { name: /todo title/i });
    const addButton = page.getByRole("button", { name: /add todo/i });

    await titleInput.fill("Dashboard Task 1");
    await addButton.click();
    await expect(page.getByText("Dashboard Task 1")).toBeVisible();
    await expect(titleInput).toHaveValue("");

    await titleInput.fill("Dashboard Task 2");
    await addButton.click();
    await expect(page.getByText("Dashboard Task 2")).toBeVisible();
    await expect(titleInput).toHaveValue("");

    await page.getByRole("checkbox", { name: /toggle completion for dashboard task 1/i }).first().click();
    await expect(progressbar).toHaveAttribute("aria-valuenow", "50");

    // 3. Switch to Tasks View, filter to Completed and use Reset filters button to restore all tasks
    await page.getByRole("button", { name: /^tasks/i }).first().click();
    await page.getByRole("button", { name: /^completed/i }).click();
    await expect(page.getByText("Dashboard Task 2")).not.toBeVisible();

    const resetBtn = page.getByRole("button", { name: /reset filters/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    await expect(page.getByText("Dashboard Task 1")).toBeVisible();
    await expect(page.getByText("Dashboard Task 2")).toBeVisible();
  });

  test("creates a time-blocked task for today via the modal composer and verifies Today's Dashboard, Calendar & Schedule view, and Notification Center", async ({ page }) => {
    const todayStr = new Date().toISOString().slice(0, 10);

    // Open New Task modal
    const newTaskBtn = page.getByRole("button", { name: /open new task modal|\+ new task/i }).first();
    await newTaskBtn.click();

    const dialog = page.getByRole("dialog", { name: /new task/i });
    await expect(dialog).toBeVisible();

    await dialog.getByRole("textbox", { name: /title/i }).fill("Product Roadmap Time-Block");
    await dialog.getByLabel(/due date/i).fill(todayStr);
    await dialog.getByLabel(/start time/i).fill("09:30");
    await dialog.getByLabel(/end time/i).fill("11:00");
    await dialog.getByRole("button", { name: /create task/i }).click();

    await expect(dialog).not.toBeVisible();

    // 1. Appears in Today's Dashboard
    const todayRegion = page.getByRole("region", { name: /today's tasks/i });
    await expect(todayRegion).toContainText("Product Roadmap Time-Block");
    await expect(todayRegion).toContainText("09:30 – 11:00");

    // 2. Notification Center shows active reminder
    const bellBtn = page.getByRole("button", { name: /notifications/i });
    await expect(bellBtn).toContainText("1");
    await bellBtn.click();
    const notifPanel = page.getByRole("region", { name: /notifications panel/i });
    await expect(notifPanel).toContainText("Product Roadmap Time-Block");

    // 3. Switch to Calendar view and verify time-blocked slot in daily schedule
    await page.getByRole("button", { name: /^calendar/i }).first().click();
    const scheduleRegion = page.getByRole("complementary", { name: /daily schedule/i });
    await expect(scheduleRegion).toContainText("Product Roadmap Time-Block");
    await expect(scheduleRegion).toContainText("09:30 – 11:00");

    // 4. Reload and verify persistence
    await page.reload();
    await expect(page.getByRole("region", { name: /today's tasks/i })).toContainText(
      "Product Roadmap Time-Block"
    );
  });

  test("filters tasks in real-time via search input on the Tasks board", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /todo title/i });
    const addButton = page.getByRole("button", { name: /add todo/i });

    await input.fill("Alpha Architecture Review");
    await addButton.click();
    await expect(page.getByText("Alpha Architecture Review")).toBeVisible();
    await expect(input).toHaveValue("");

    await input.fill("Beta Design Sprint");
    await addButton.click();
    await expect(page.getByText("Beta Design Sprint")).toBeVisible();
    await expect(input).toHaveValue("");

    // Switch to Tasks view
    await page.getByRole("button", { name: /^tasks/i }).first().click();

    // Verify both are visible
    await expect(page.getByText("Alpha Architecture Review")).toBeVisible();
    await expect(page.getByText("Beta Design Sprint")).toBeVisible();

    // Type in search input
    const searchInput = page.getByRole("textbox", { name: /search tasks/i });
    await searchInput.fill("Architecture");

    // Only Alpha should be visible
    await expect(page.getByText("Alpha Architecture Review")).toBeVisible();
    await expect(page.getByText("Beta Design Sprint")).not.toBeVisible();

    // Clear search
    await searchInput.fill("");
    await expect(page.getByText("Beta Design Sprint")).toBeVisible();
  });

  test.afterAll(async ({ request }) => {
    const res = await request.get("/api/todos");
    if (res.ok()) {
      const items = (await res.json()) as Array<{ id: string }>;
      for (const item of items) {
        await request.delete(`/api/todos/${item.id}`);
      }
    }
  });
});
