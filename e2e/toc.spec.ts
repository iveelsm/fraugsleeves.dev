import { test, expect } from "@playwright/test";

test.describe("Table of Contents scrolling", () => {
	// TOC sidebar is hidden on mobile viewports
	test.skip(({ isMobile }) => isMobile, "TOC is desktop only");

	test.beforeEach(async ({ page }) => {
		// Navigate to a blog post that has headings
		await page.goto("/blog/epoll");
	});

	test("should display table of contents sidebar", async ({ page }) => {
		const toc = page.locator(".article-toc");
		await expect(toc).toBeVisible();
	});

	test("should have links matching page headings", async ({ page }) => {
		const tocLinks = page.locator(".article-toc a");
		const headings = page.locator(
			"main h1[id], main h2[id], main h3[id], main h4[id]",
		);

		const tocCount = await tocLinks.count();
		const headingsCount = await headings.count();

		// TOC should have entries for headings
		expect(tocCount).toBeGreaterThan(0);
		expect(tocCount).toBeLessThanOrEqual(headingsCount);
	});

	test("should scroll to heading when TOC link is clicked", async ({
		page,
	}) => {
		const firstTocLink = page.locator(".article-toc a").first();
		const href = await firstTocLink.getAttribute("href");

		await firstTocLink.click();

		// URL should have the hash
		await expect(page).toHaveURL(new RegExp(`${href}$`));

		// The target heading should be in view
		if (href) {
			const targetHeading = page.locator(href);
			await expect(targetHeading).toBeInViewport();
		}
	});

	test("should highlight TOC link after clicking it", async ({ page }) => {
		// Get the second TOC link and click it
		const tocLinks = page.locator(".article-toc a");
		const secondLink = tocLinks.nth(1);

		await secondLink.click();

		// Wait for scroll and intersection observer to process
		await page.waitForTimeout(500);

		// The clicked link should become active
		await expect(secondLink).toHaveClass(/active/);
	});

	test("should update active link when scrolling manually", async ({
		page,
	}) => {
		// Scroll down the page
		await page.evaluate(() => {
			window.scrollBy(0, 500);
		});

		// Wait for intersection observer to process
		await page.waitForTimeout(300);

		// At least one TOC link should be active
		const activeLink = page.locator(".article-toc a.active");
		await expect(activeLink).toBeVisible();
	});

	test("should highlight last heading when scrolled to bottom", async ({
		page,
	}) => {
		// Scroll to the bottom of the page
		await page.evaluate(() => {
			window.scrollTo(0, document.documentElement.scrollHeight);
		});

		// Wait for scroll handler
		await page.waitForTimeout(500);

		// Get all TOC links and check the last one is active
		const tocLinks = page.locator(".article-toc a");
		const lastLink = tocLinks.last();

		await expect(lastLink).toHaveClass(/active/);
	});
});
