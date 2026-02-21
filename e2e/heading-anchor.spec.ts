import { test, expect } from "@playwright/test";

test.describe("Heading links should...", { tag: ["@desktop", "@mobile"] }, () => {
	test.beforeEach(async ({ page, context, browserName }) => {
		if (browserName === "chromium") {
			await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		}
		await page.goto("/blog/epoll");
	});

	test("display anchor links on headings", async ({ page }) => {
		const anchorLinks = page.locator(".post-content .heading-anchor");
		const count = await anchorLinks.count();

		expect(count).toBeGreaterThan(0);
	});

	test("copy to clipboard when anchor is clicked", async ({ page }) => {
		const anchorLink = page.locator(".post-content .heading-anchor").first();
		const href = await anchorLink.getAttribute("href");

		await anchorLink.click();
		const clipboardText = await page.evaluate(() =>
			navigator.clipboard.readText(),
		);

		expect(clipboardText).toContain(href);
		expect(clipboardText).toMatch(/^https?:\/\//);
	});

	test("add copied class temporarily after clicking", async ({ page }) => {
		const anchorLink = page.locator(".post-content .heading-anchor").first();
		await anchorLink.click();
		await expect(anchorLink).toHaveClass(/copied/);

		// Wait for the timeout (1500ms in the script)
		await page.waitForTimeout(1600);

		await expect(anchorLink).not.toHaveClass(/copied/);
	});

	test("update URL hash when anchor is clicked", async ({ page }) => {
		const anchorLink = page.locator(".post-content .heading-anchor").first();
		const href = await anchorLink.getAttribute("href");
		await anchorLink.click();
		await expect(page).toHaveURL(new RegExp(`${href}$`));
	});

	test("not navigate away from page on anchor click", async ({ page }) => {
		const initialUrl = page.url();
		const anchorLink = page.locator(".post-content .heading-anchor").first();
		await anchorLink.click();
		const currentUrl = page.url();
		expect(currentUrl).toContain(initialUrl.split("#")[0]);
	});

	test("work with multiple anchor clicks", async ({ page }) => {
		const anchorLinks = page.locator(".post-content .heading-anchor");
		const count = await anchorLinks.count();

		if (count >= 2) {
			const firstAnchor = anchorLinks.first();

			await firstAnchor.click();
			await expect(firstAnchor).toHaveClass(/copied/);

			await page.waitForTimeout(200);

			const secondAnchor = anchorLinks.nth(1);
			await secondAnchor.click();
			await expect(secondAnchor).toHaveClass(/copied/);
		}
	});
});

test.describe("Heading links should not...", () => {
	test("fail with not clipboard permission and should fallback", async ({ page, context}) => {
		await context.clearPermissions();
		await page.goto("/blog/epoll");

		const anchorLink = page.locator(".post-content .heading-anchor").first();
		const href = await anchorLink.getAttribute("href");

		await anchorLink.click();
		await expect(page).toHaveURL(new RegExp(`${href}$`));
	});
});
