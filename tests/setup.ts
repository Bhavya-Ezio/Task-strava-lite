import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  await page.goto("http://localhost:3000/login");

  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click("button[type=submit]");

  // Wait for redirect after login
  await page.waitForURL("**/dashboard");

  // Save session state (cookies, localStorage)
  await page.context().storageState({ path: "storageState.json" });
});
