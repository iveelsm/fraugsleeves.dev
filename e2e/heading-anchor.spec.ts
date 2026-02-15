import { test, expect } from "@playwright/test";

test.describe("Heading Anchor copy", () => {
	test.beforeEach(async ({ page, context, browserName }) => {
		// Grant clipboard permissions (Chromium only - Firefox doesn't support these permissions)
		if (browserName === "chromium") {
			await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		}
		await page.goto("/blog/epoll");
	});

	test("should display anchor links on headings", async ({ page }) => {
		const anchorLinks = page.locator(".post-content .heading-anchor");
		const count = await anchorLinks.count();

		expect(count).toBeGreaterThan(0);
	});

	test("should copy URL to clipboard when anchor is clicked", async ({
		page,
		browserName,
	}) => {
		// Skip clipboard verification on Firefox - it doesn't support clipboard permissions
		test.skip(browserName === "firefox", "Firefox doesn't support clipboard permissions");

		const anchorLink = page.locator(".post-content .heading-anchor").first();
		const href = await anchorLink.getAttribute("href");

		await anchorLink.click();

		// Check clipboard content
		const clipboardText = await page.evaluate(() =>
			navigator.clipboard.readText(),
		);

		expect(clipboardText).toContain(href);
		expect(clipboardText).toMatch(/^https?:\/\//);
	});

	test("should add copied class temporarily after clicking", async ({
		page,
	}) => {
		const anchorLink = page.locator(".post-content .heading-anchor").first();

		await anchorLink.click();

		// Should have copied class immediately after click
		await expect(anchorLink).toHaveClass(/copied/);

		// Wait for the timeout (1500ms in the script)
		await page.waitForTimeout(1600);

		// Should no longer have copied class
		await expect(anchorLink).not.toHaveClass(/copied/);
	});

	test("should update URL hash when anchor is clicked", async ({ page }) => {
		const anchorLink = page.locator(".post-content .heading-anchor").first();
		const href = await anchorLink.getAttribute("href");

		await anchorLink.click();

		// URL should have the hash
		await expect(page).toHaveURL(new RegExp(`${href}$`));
	});

	test("should not navigate away from page on anchor click", async ({
		page,
	}) => {
		const initialUrl = page.url();
		const anchorLink = page.locator(".post-content .heading-anchor").first();

		await anchorLink.click();

		// Should still be on the same page (just with a hash)
		const currentUrl = page.url();
		expect(currentUrl).toContain(initialUrl.split("#")[0]);
	});

	test("should work with multiple anchor clicks", async ({ page }) => {
		const anchorLinks = page.locator(".post-content .heading-anchor");
		const count = await anchorLinks.count();

		if (count >= 2) {
			const firstAnchor = anchorLinks.first();
			const secondAnchor = anchorLinks.nth(1);

			// Click first anchor
			await firstAnchor.click();
			await expect(firstAnchor).toHaveClass(/copied/);

			// Wait a bit
			await page.waitForTimeout(200);

			// Click second anchor
			await secondAnchor.click();
			await expect(secondAnchor).toHaveClass(/copied/);

			// First should no longer have copied class (or be transitioning)
			// The visual feedback should work independently
		}
	});
});

test.describe("Heading Anchor copy - fallback behavior", () => {
	test("should fallback to hash navigation if clipboard fails", async ({
		page,
		context,
	}) => {
		// Don't grant clipboard permissions to test fallback
		await context.clearPermissions();
		await page.goto("/blog/epoll");

		const anchorLink = page.locator(".post-content .heading-anchor").first();
		const href = await anchorLink.getAttribute("href");

		await anchorLink.click();

		// Should still update the URL hash
		await expect(page).toHaveURL(new RegExp(`${href}$`));
	});
});
