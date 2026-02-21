import { test, expect } from "@playwright/test";

// Use mobile viewport for these tests
// Note: isMobile is only supported in Chromium and WebKit, not Firefox
test.use({
	viewport: { width: 375, height: 667 },
	isMobile: true,
	hasTouch: true,
});

test.describe("Mobile navigation should...", { tag: "@mobile" }, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("show hamburger button on mobile", async ({ page }) => {
		const hamburgerBtn = page.locator("#hamburger-btn");
		await expect(hamburgerBtn).toBeVisible();
	});

	test("hide desktop navigation on mobile", async ({ page }) => {
		const desktopNav = page.locator(".nav-links-desktop");
		await expect(desktopNav).not.toBeVisible();
	});

	test("open mobile nav overlay when hamburger is clicked", async ({
		page,
	}) => {
		const hamburgerBtn = page.locator("#hamburger-btn");
		const mobileOverlay = page.locator("#mobile-nav-overlay");

		// Initially overlay should not be visible
		await expect(mobileOverlay).not.toBeVisible();
		await hamburgerBtn.click();

		// Overlay should now be visible
		await expect(mobileOverlay).toBeVisible();
	});

	test("show navigation links in overlay", async ({ page }) => {
		const hamburgerBtn = page.locator("#hamburger-btn");

		await hamburgerBtn.click();

		const navLinks = page.locator(".mobile-nav-link");
		const count = await navLinks.count();

		expect(count).toBeGreaterThan(0);

		// All nav links should be visible
		for (let i = 0; i < count; i++) {
			await expect(navLinks.nth(i)).toBeVisible();
		}
	});

	test("close overlay when hamburger is clicked again", async ({ page }) => {
		const hamburgerBtn = page.locator("#hamburger-btn");
		const mobileOverlay = page.locator("#mobile-nav-overlay");

		// Open
		await hamburgerBtn.click();
		await expect(mobileOverlay).toBeVisible();

		// Close
		await hamburgerBtn.click();
		await expect(mobileOverlay).not.toBeVisible();
	});

	test("update aria-expanded attribute", async ({ page }) => {
		const hamburgerBtn = page.locator("#hamburger-btn");

		// Initially should be false
		await expect(hamburgerBtn).toHaveAttribute("aria-expanded", "false");
		await hamburgerBtn.click();

		// Should be true when open
		await expect(hamburgerBtn).toHaveAttribute("aria-expanded", "true");
		await hamburgerBtn.click();

		// Should be false again
		await expect(hamburgerBtn).toHaveAttribute("aria-expanded", "false");
	});

	test("navigate to page when nav link is clicked", async ({ page }) => {
		const hamburgerBtn = page.locator("#hamburger-btn");
		await hamburgerBtn.click();

		// Find the blog link
		const blogLink = page.locator('.mobile-nav-link[href="/blog"]');
		if ((await blogLink.count()) > 0) {
			await blogLink.click();
			await expect(page).toHaveURL(/\/blog/);
		}
	});

	test("close overlay when navigating", async ({ page }) => {
		const hamburgerBtn = page.locator("#hamburger-btn");
		const mobileOverlay = page.locator("#mobile-nav-overlay");

		await hamburgerBtn.click();
		await expect(mobileOverlay).toBeVisible();

		// Click a nav link
		const navLink = page.locator(".mobile-nav-link").first();
		await navLink.click();

		// Wait for navigation
		await page.waitForLoadState("networkidle");

		// Overlay should be closed (or page reloaded)
		await expect(mobileOverlay).not.toBeVisible();
	});

	test("toggle between hamburger and close icons", async ({ page }) => {
		const hamburgerBtn = page.locator("#hamburger-btn");
		const hamburgerIcon = page.locator(".hamburger-icon");
		const closeIcon = page.locator("#hamburger-btn .close-icon");

		// Initially hamburger should be visible, close should be hidden
		await expect(hamburgerIcon).toBeVisible();
		await expect(closeIcon).not.toBeVisible();

		await hamburgerBtn.click();

		// After opening, close icon should be visible, hamburger hidden
		await expect(closeIcon).toBeVisible();
		await expect(hamburgerIcon).not.toBeVisible();
	});
});

test.describe("Mobile search should...", { tag: "@mobile" }, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("should show mobile search button", async ({ page }) => {
		const mobileSearchWrapper = page.locator(".mobile-search-wrapper");
		await expect(mobileSearchWrapper).toBeVisible();
	});

	test("should open search overlay on mobile", async ({ page }) => {
		// Mobile uses a different search toggle ID
		const searchToggle = page.locator("#mobile-search-toggle");
		await searchToggle.click();

		// Mobile search overlay should be visible
		const mobileSearchOverlay = page.locator("#search-overlay");
		await expect(mobileSearchOverlay).toBeVisible();
	});
});
