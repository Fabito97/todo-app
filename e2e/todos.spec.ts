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
});
