import { expect, test, type Page } from "@playwright/test";

async function gotoApp(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

test("public onboarding path is reachable", async ({ page }) => {
  await gotoApp(page, "/");
  await expect(page.getByRole("heading", { name: /manage your portfolio/i })).toBeVisible();
  await page.getByRole("link", { name: /get started/i }).first().click();
  await expect(page).toHaveURL(/\/workspace/);
});

test("dashboard and operational routes render seeded data", async ({ page }) => {
  await gotoApp(page, "/dashboard");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Gross Revenue").first()).toBeVisible();

  await gotoApp(page, "/properties");
  await expect(page.getByRole("heading", { name: "Properties" })).toBeVisible();
  await expect(page.getByText("Villa Azure").first()).toBeVisible();

  await gotoApp(page, "/bookings");
  await expect(page.getByText("John Doe").first()).toBeVisible();
});

test("demo login routes personas into dedicated portals", async ({ page }) => {
  await gotoApp(page, "/login");
  await page.getByLabel("Demo persona").selectOption("cleaner");
  await page.getByRole("button", { name: "Log In" }).click();
  await expect(page).toHaveURL(/\/field\/cleaning/);
  await expect(page.getByRole("heading", { name: /today's tasks/i })).toBeVisible();

  await gotoApp(page, "/owner");
  await expect(page).toHaveURL(/\/dashboard/);
});

test("manager can create property and booking in demo mode", async ({ page }) => {
  await gotoApp(page, "/properties");
  await page.getByRole("button", { name: /add property/i }).last().click();
  await page.getByPlaceholder("Property name").fill("Playwright Harbor House");
  await page.getByPlaceholder("Address").fill("10 Harbor Way, Miami, FL");
  await page.getByPlaceholder("Owner name").fill("QA Owner");
  await page.getByRole("button", { name: /create property/i }).click();
  await expect(page.getByText("Property added.")).toBeVisible();

  await gotoApp(page, "/bookings");
  await page.getByRole("button", { name: /new booking/i }).click();
  await page.getByPlaceholder("Guest or tenant name").fill("Playwright Guest");
  await page.getByPlaceholder("Email").fill("playwright@example.com");
  await page.getByPlaceholder("Amount").fill("1250");
  await page.getByRole("button", { name: /create booking/i }).click();
  await expect(page.getByText("Booking created.")).toBeVisible();
});

test("mobile cleaning issue report flow confirms submission", async ({ page }) => {
  await gotoApp(page, "/cleaning");
  await page.getByRole("button", { name: /report issue/i }).click();
  await page.setInputFiles('input[name="photo"]', {
    name: "issue.png",
    mimeType: "image/png",
    buffer: Buffer.from("propflow"),
  });
  await expect(page.getByText("Photo selected")).toBeVisible();
  await page.getByPlaceholder("Describe the issue in detail...").fill("Broken lamp in living room.");
  await page.getByRole("button", { name: /submit report/i }).click();
  await expect(page.getByRole("heading", { name: /issue reported/i })).toBeVisible();
});

test("dedicated role portals render live operations surfaces", async ({ page }) => {
  await gotoApp(page, "/owner");
  await expect(page.getByRole("heading", { name: "Owner Portal" })).toBeVisible();

  await gotoApp(page, "/field/maintenance");
  await expect(page.getByRole("heading", { name: "My Tasks" })).toBeVisible();

  await gotoApp(page, "/guest");
  await expect(page.getByRole("heading", { name: "Guest Portal" })).toBeVisible();
});

test("route aliases, calendar, notifications, and not-found page render", async ({ page }) => {
  await gotoApp(page, "/calendar");
  await expect(page.getByRole("heading", { name: "Operations Calendar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "month" })).toBeVisible();

  await gotoApp(page, "/notifications");
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  await page.getByRole("button", { name: /mark all read/i }).click();
  await expect(page.locator("article").first().getByText("read", { exact: true })).toBeVisible();

  await gotoApp(page, "/settings");
  await expect(page).toHaveURL(/\/settings\/workspace/);

  await gotoApp(page, "/account");
  await expect(page).toHaveURL(/\/settings\/account/);

  await gotoApp(page, "/owner-dashboard");
  await expect(page).toHaveURL(/\/owner/);
  await expect(page.getByRole("heading", { name: "Owner Portal" })).toBeVisible();

  await gotoApp(page, "/missing-launch-route");
  await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /back to dashboard/i })).toBeVisible();
});

test("guest and workspace action forms create live demo records", async ({ page }) => {
  await gotoApp(page, "/guest");
  await page.getByRole("button", { name: /maintenance request/i }).click();
  await page.getByPlaceholder("Leaky faucet").fill("Playwright guest request");
  await page.getByPlaceholder("Tell us what needs attention.").fill("Kitchen faucet is leaking.");
  await page.getByRole("button", { name: /submit request/i }).click();
  await expect(page.getByText("Maintenance request submitted.")).toBeVisible();

  await gotoApp(page, "/settings/workspace");
  await page.getByRole("button", { name: /invite member/i }).click();
  await page.getByPlaceholder("teammate@example.com").fill("cleaner.qa@example.com");
  await page.getByRole("button", { name: /create invite/i }).click();
  await expect(page.getByText("Demo invite created.")).toBeVisible();
});

test("csv export route returns downloadable data", async ({ request }) => {
  const response = await request.get("/api/exports/csv");
  expect(response.ok()).toBeTruthy();
  expect(await response.text()).toContain("property,Villa Azure");
});
