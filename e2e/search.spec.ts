import { test, expect } from "@playwright/test";

test.describe("Search should...", { tag: ["@desktop"] }, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("show search toggle button", async ({ page }) => {
		const searchToggle = page.locator("#search-toggle");
		await expect(searchToggle).toBeVisible();
	});

	test("open search input when toggle is clicked", async ({ page }) => {
		const searchToggle = page.locator("#search-toggle");
		const searchContainer = page.locator("#search-container");

		await searchToggle.click();

		// Container should have search-open class
		await expect(searchContainer).toHaveClass(/search-open/);
	});

	test("show search results when typing", async ({ page }) => {
		const searchToggle = page.locator("#search-toggle");
		const searchInput = page.locator("#search-input");
		const searchDropdown = page.locator("#search-dropdown");

		await searchToggle.click();
		await searchInput.fill("epoll");

		// Wait for search results to appear (pagefind may take a moment)
		await expect(searchDropdown).toHaveClass(/visible/, { timeout: 5000 });

		// Check that results container has content
		const searchResults = page.locator("#search-results");
		await expect(searchResults).not.toBeEmpty();
	});

	test("close search when clear button is clicked", async ({ page }) => {
		const searchToggle = page.locator("#search-toggle");
		const searchInput = page.locator("#search-input");
		const searchClear = page.locator("#search-clear");
		const searchContainer = page.locator("#search-container");

		await searchToggle.click();
		await searchInput.fill("test");
		await searchClear.click();

		// Container should no longer have search-open class
		await expect(searchContainer).not.toHaveClass(/search-open/);
		// Input should be cleared
		await expect(searchInput).toHaveValue("");
	});

	test("navigate to search result on click", async ({ page }) => {
		const searchToggle = page.locator("#search-toggle");
		const searchInput = page.locator("#search-input");

		await searchToggle.click();
		await searchInput.fill("epoll");

		// Wait for results and click the first one
		const firstResult = page.locator("#search-results a").first();
		await expect(firstResult).toBeVisible({ timeout: 5000 });

		await firstResult.click();

		// Should navigate to a blog post
		await expect(page).toHaveURL(/\/blog\//);
	});

	test("close search when pressing escape", async ({ page }) => {
		const searchToggle = page.locator("#search-toggle");
		const searchContainer = page.locator("#search-container");

		await searchToggle.click();
		await expect(searchContainer).toHaveClass(/search-open/);

		await page.keyboard.press("Escape");

		// Container should no longer have search-open class
		await expect(searchContainer).not.toHaveClass(/search-open/);
	});

	test("close search when clicking outside", async ({ page }) => {
		const searchToggle = page.locator("#search-toggle");
		const searchContainer = page.locator("#search-container");

		await searchToggle.click();
		await expect(searchContainer).toHaveClass(/search-open/);

		// Click outside the search container
		await page.locator("body").click({ position: { x: 10, y: 10 } });

		// Container should no longer have search-open class
		await expect(searchContainer).not.toHaveClass(/search-open/);
	});
});
