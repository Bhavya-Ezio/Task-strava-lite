// tests/e2e.spec.ts
import { test, expect } from "@playwright/test";
import { defineConfig } from "@playwright/test";

export default defineConfig({
    use: {
        baseURL: "http://localhost:3000",
        storageState: "storageState.json", // 👈 reuse login session
    },
});

const BASE_URL = "http://localhost:3000";

test.describe("End-to-End Flow test", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
    });

    test("Add, edit, delete activity", async ({ page }) => {
        // Login
        await page.goto(`${BASE_URL}/login`);
        await page.fill('input[name="email"]', "22dcs012@charusat.edu.in");
        await page.fill('input[name="password"]', "123456");
        await page.click("button[type=submit]");

        //wait for UI to load than go to addActivity
        await page.waitForSelector("text=Dashboard");
        // Add activity
        await page.goto(`${BASE_URL}/addActivity/`);

        await page.getByText("Run").click(); // or "Ride" if you want cycling

        // Fill fields
        await page.getByLabel("Title *").fill("Morning Park Run");
        await page.getByLabel("Distance (km) *").fill("5");
        await page.getByLabel("Duration (min) *").fill("30");
        await page.getByLabel("Notes").fill("Felt good, sunny weather");

        await page.getByRole("button", { name: "Save Activity" }).click();

        await expect(page).toHaveURL(`${BASE_URL}/`);

        await expect(page.getByText("Morning Park Run").first()).toBeVisible();

        await page.getByText("Morning Park Run").first().click();
        await page.waitForSelector("text=Morning Park Run");

        // Click on the "Activities" tab first
        // await page.getByRole("button", { name: /activities/i }).click();
        await page.getByText("Morning Park Run").first().click();

        // Edit
        const uniqueSuffix = `-${Date.now()}`;
        const newTitle = `Evening Run${uniqueSuffix}`;
        await page.getByRole("button", { name: /edit/i }).click();
        // Click the title input directly by its name attribute
        await page.click('input[name="title"]');
        await page.fill('input[name="title"]', newTitle);
        await page.getByRole("button", { name: /confirm/i }).click();
        await expect(page.locator(`text=${newTitle}`)).toBeVisible();

        // // Delete
        await page.getByRole("button", { name: /delete/i }).click();
        await page.waitForSelector("text=Dashboard");
        await expect(page.locator(`text=${newTitle}`)).not.toBeVisible();
    });
});
