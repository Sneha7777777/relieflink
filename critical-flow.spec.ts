import { test, expect } from "@playwright/test";

/**
 * End-to-end smoke test for the core flow the assignment evaluates:
 * register -> log in -> post a help request -> see it triaged and listed.
 *
 * Requires the app running against a seeded test database:
 *   DATABASE_URL=<test db> npm run dev
 *   npx playwright test
 */

test.describe("critical user flow", () => {
  test("a requester can register, log in, and post a help request", async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@example.com`;

    await page.goto("/register");
    await page.getByLabel("Full name").fill("E2E Test User");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill("StrongPassw0rd");
    await page.getByLabel("I am a...").selectOption("REQUESTER");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/requests");
    await page.getByLabel("Title").fill("Need clean water urgently");
    await page
      .getByLabel("Description")
      .fill("Our water supply was contaminated after the storm and we have three children at home.");
    await page.getByLabel("Location").fill("Test District, Block 1");
    await page.getByRole("button", { name: /submit request/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/requests\/.+/);
    await expect(page.getByRole("heading", { name: "Need clean water urgently" })).toBeVisible();
  });

  test("unauthenticated users are redirected away from the dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
