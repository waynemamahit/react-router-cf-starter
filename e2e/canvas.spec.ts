import { expect, type Locator, type Page, test } from "@playwright/test";

async function waitForCanvas(page: Page): Promise<Locator> {
  await expect(
    page.getByRole("heading", { name: "Interactive Canvas" }),
  ).toBeVisible();

  const ready = page.locator('[data-canvas-ready="true"]');
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await expect(ready).toBeVisible({ timeout: 15000 });
      break;
    } catch (error) {
      if (attempt === 2) throw error;
      await page.reload();
    }
  }

  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect
    .poll(async () => {
      const box = await canvas.boundingBox();
      return box !== null && box.width > 50 && box.height > 50;
    })
    .toBeTruthy();
  return canvas;
}

async function dragOnCanvas(
  page: Page,
  canvas: Locator,
  from: { x: number; y: number },
  to: { x: number; y: number },
  steps = 10,
): Promise<void> {
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error("Canvas is not visible");
  }
  await page.mouse.move(box.x + from.x, box.y + from.y);
  await page.mouse.down();
  await page.mouse.move(box.x + to.x, box.y + to.y, { steps });
  await page.mouse.up();
}

test.describe("Interactive Canvas", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto("/");
    await waitForCanvas(page);
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle("Interactive Canvas");
  });

  test("displays toolbar with all buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: /undo/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /redo/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /delete/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /export/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /reset/i })).toBeVisible();
  });

  test("displays stats showing zero counts initially", async ({ page }) => {
    await expect(page.getByText("Points")).toBeVisible();
    await expect(page.getByText("Rectangles")).toBeVisible();
    await expect(page.getByText("Squares")).toBeVisible();
  });

  test("undo and redo buttons are disabled initially", async ({ page }) => {
    const undoBtn = page.getByRole("button", { name: /undo/i });
    const redoBtn = page.getByRole("button", { name: /redo/i });
    await expect(undoBtn).toBeDisabled();
    await expect(redoBtn).toBeDisabled();
  });

  test("delete button is disabled when nothing is selected", async ({
    page,
  }) => {
    const deleteBtn = page.getByRole("button", { name: /delete/i });
    await expect(deleteBtn).toBeDisabled();
  });

  test("canvas is visible and renders", async ({ page }) => {
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("clicking canvas creates a point and enables undo", async ({ page }) => {
    const canvas = page.locator("canvas");
    await canvas.click({ position: { x: 200, y: 200 } });

    const undoBtn = page.getByRole("button", { name: /undo/i });
    await expect(undoBtn).toBeEnabled();
  });

  test("drag on canvas creates a rectangle", async ({ page }) => {
    const canvas = page.locator("canvas");
    await dragOnCanvas(page, canvas, { x: 100, y: 100 }, { x: 320, y: 200 });

    const undoBtn = page.getByRole("button", { name: /undo/i });
    await expect(undoBtn).toBeEnabled();
    await expect(page.locator(".stat-value").nth(1)).toHaveText("1");
  });

  test("undo works after creating a point", async ({ page }) => {
    const canvas = page.locator("canvas");
    await canvas.click({ position: { x: 200, y: 200 } });

    const undoBtn = page.getByRole("button", { name: /undo/i });
    await expect(undoBtn).toBeEnabled();

    await undoBtn.click();
    await expect(undoBtn).toBeDisabled();
  });

  test("user guide opens and closes", async ({ page }) => {
    await page.getByRole("button", { name: "User Guide" }).click();

    const guideTitle = page.getByRole("heading", { name: "Canvas Guide" });
    await expect(guideTitle).toBeVisible();

    await page
      .getByRole("button", { name: "Close guide", exact: true })
      .click();
    await expect(guideTitle).not.toBeVisible();
  });

  test("export menu opens with format options", async ({ page }) => {
    await page.getByRole("button", { name: /export/i }).click();

    await expect(
      page.getByRole("menuitem", { name: "Export as PNG" }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: "Export as JPG" }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: "Export as SVG" }),
    ).toBeVisible();
  });

  test("keyboard shortcuts work for undo", async ({ page }) => {
    const canvas = page.locator("canvas");
    await canvas.click({ position: { x: 200, y: 200 } });

    const undoBtn = page.getByRole("button", { name: /undo/i });
    await expect(undoBtn).toBeEnabled();

    await page.keyboard.press("Control+z");
    await expect(undoBtn).toBeDisabled();
  });

  test("keyboard shortcuts work for redo", async ({ page }) => {
    const canvas = page.locator("canvas");
    await canvas.click({ position: { x: 200, y: 200 } });

    const undoBtn = page.getByRole("button", { name: /undo/i });
    const redoBtn = page.getByRole("button", { name: /redo/i });
    await expect(undoBtn).toBeEnabled();

    await page.keyboard.press("Control+z");
    await expect(undoBtn).toBeDisabled();
    await expect(redoBtn).toBeEnabled();

    await page.keyboard.press("Control+Shift+z");
    await expect(undoBtn).toBeEnabled();
    await expect(redoBtn).toBeDisabled();
  });

  test("drag with Shift creates a square in stats", async ({ page }) => {
    const canvas = page.locator("canvas");
    await page.keyboard.down("Shift");
    await dragOnCanvas(page, canvas, { x: 100, y: 100 }, { x: 280, y: 220 });
    await page.keyboard.up("Shift");

    await expect(page.locator(".stat-value").nth(2)).toHaveText("1");
  });

  test("pressing Shift mid-drag creates a square", async ({ page }) => {
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    if (!box) {
      throw new Error("Canvas is not visible");
    }

    await page.mouse.move(box.x + 100, box.y + 100);
    await page.mouse.down();
    await page.mouse.move(box.x + 200, box.y + 160, { steps: 5 });
    await page.keyboard.down("Shift");
    await page.mouse.move(box.x + 280, box.y + 220, { steps: 10 });
    await page.mouse.up();
    await page.keyboard.up("Shift");

    await expect(page.locator(".stat-value").nth(2)).toHaveText("1");
  });

  test("delete key removes selected shape", async ({ page }) => {
    const canvas = page.locator("canvas");
    const deleteBtn = page.getByRole("button", { name: /delete/i });

    await canvas.click({ position: { x: 200, y: 200 } });
    const undoBtn = page.getByRole("button", { name: /undo/i });
    await expect(undoBtn).toBeEnabled();

    await canvas.click({ position: { x: 200, y: 200 } });
    await expect(deleteBtn).toBeEnabled();

    await page.keyboard.press("Delete");

    await expect(page.locator(".stat-value").nth(0)).toHaveText("0");
  });

  test("delete button removes selected shape", async ({ page }) => {
    const canvas = page.locator("canvas");
    await canvas.click({ position: { x: 200, y: 200 } });

    const undoBtn = page.getByRole("button", { name: /undo/i });
    await expect(undoBtn).toBeEnabled();

    await canvas.click({ position: { x: 200, y: 200 } });
    const deleteBtn = page.getByRole("button", { name: /delete/i });
    await expect(deleteBtn).toBeEnabled();
    await deleteBtn.click();

    await expect(page.locator(".stat-value").nth(0)).toHaveText("0");
  });

  test("redo after undo restores shape", async ({ page }) => {
    const canvas = page.locator("canvas");
    await canvas.click({ position: { x: 200, y: 200 } });

    const undoBtn = page.getByRole("button", { name: /undo/i });
    const redoBtn = page.getByRole("button", { name: /redo/i });
    await expect(undoBtn).toBeEnabled();

    await undoBtn.click();
    await expect(undoBtn).toBeDisabled();
    await expect(redoBtn).toBeEnabled();

    await redoBtn.click();
    await expect(undoBtn).toBeEnabled();
    await expect(redoBtn).toBeDisabled();
  });

  test("reset clears all shapes and stats", async ({ page }) => {
    const canvas = page.locator("canvas");
    await canvas.click({ position: { x: 200, y: 200 } });
    await dragOnCanvas(page, canvas, { x: 100, y: 100 }, { x: 300, y: 300 });

    await page.getByRole("button", { name: /reset/i }).click();

    await expect(page.locator(".stat-value").nth(0)).toHaveText("0");
    await expect(page.locator(".stat-value").nth(1)).toHaveText("0");
  });

  test("multiple shape types update stats correctly", async ({ page }) => {
    const canvas = page.locator("canvas");
    await canvas.click({ position: { x: 50, y: 50 } });

    await page.keyboard.down("Shift");
    await dragOnCanvas(page, canvas, { x: 120, y: 120 }, { x: 300, y: 220 });
    await page.keyboard.up("Shift");

    await expect(page.locator(".stat-value").nth(0)).toHaveText("1");
    await expect(page.locator(".stat-value").nth(2)).toHaveText("1");
  });
});
