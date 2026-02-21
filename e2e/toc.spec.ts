import { test, expect } from "@playwright/test";

test.describe("Table of contents should...",  { tag: "@desktop" }, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/blog/epoll");
	});

	test("display table of contents sidebar", async ({ page }) => {
		const toc = page.locator(".article-toc");
		await expect(toc).toBeVisible();
	});

	test("have links matching page headings", async ({ page }) => {
		const tocLinks = page.locator(".article-toc a");
		const headings = page.locator(
			"main h1[id], main h2[id], main h3[id], main h4[id]",
		);

		const tocCount = await tocLinks.count();
		const headingsCount = await headings.count();

		expect(tocCount).toBeGreaterThan(0);
		expect(tocCount).toBeLessThanOrEqual(headingsCount);
	});

	test("scroll to heading when TOC link is clicked", async ({ page }) => {
		const firstTocLink = page.locator(".article-toc a").first();
		const href = await firstTocLink.getAttribute("href");

		await firstTocLink.click();
		await expect(page).toHaveURL(new RegExp(`${href}$`));
		if (href) {
			const targetHeading = page.locator(href);
			await expect(targetHeading).toBeInViewport();
		}
	});

	test("highlight link after clicking it", async ({ page }) => {
		const tocLinks = page.locator(".article-toc a");
		const secondLink = tocLinks.nth(1);

		await secondLink.click();

		// Wait for scroll and intersection observer to process
		await page.waitForTimeout(500);
		await expect(secondLink).toHaveClass(/active/);
	});

	test("update active link when scrolling manually", async ({ page }) => {
		await page.evaluate(() => {
			window.scrollBy(0, 500);
		});

		// Wait for intersection observer to process
		await page.waitForTimeout(300);
		const activeLink = page.locator(".article-toc a.active");
		await expect(activeLink).toBeVisible();
	});

	test("highlight last heading when scrolled to bottom", async ({ page }) => {
		await page.evaluate(() => {
			window.scrollTo(0, document.documentElement.scrollHeight);
		});

		// Wait for scroll handler
		await page.waitForTimeout(500);
		const tocLinks = page.locator(".article-toc a");
		const lastLink = tocLinks.last();

		await expect(lastLink).toHaveClass(/active/);
	});
});
