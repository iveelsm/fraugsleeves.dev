import { test, expect } from "@playwright/test";

test.describe("Tag Filtering", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/blog");
	});

	test("should display all posts by default", async ({ page }) => {
		const postsList = page.locator("#posts-list");
		const postItems = page.locator(".post-item");

		await expect(postsList).toBeVisible();
		const count = await postItems.count();
		expect(count).toBeGreaterThan(0);

		// All posts should be visible
		for (let i = 0; i < count; i++) {
			await expect(postItems.nth(i)).toBeVisible();
		}
	});

	test("should not show filter header by default", async ({ page }) => {
		const filterHeader = page.locator("#filter-header");
		await expect(filterHeader).not.toBeVisible();
	});

	test("should filter posts when clicking a tag", async ({ page }) => {
		// Click on a tag link
		const tagLink = page.locator(".post-tag").first();
		const tagName = await tagLink.getAttribute("data-tag");

		await tagLink.click();

		// URL should have the tag parameter
		await expect(page).toHaveURL(new RegExp(`tag=${tagName}`));

		// Filter header should be visible
		const filterHeader = page.locator("#filter-header");
		await expect(filterHeader).toBeVisible();

		// Tag name should be displayed
		const filterTagName = page.locator("#filter-tag-name");
		await expect(filterTagName).toHaveText(tagName!);
	});

	test("should show only posts with selected tag", async ({ page }) => {
		// Get a tag and its associated post count
		const tagLink = page.locator(".post-tag").first();
		const tagName = await tagLink.getAttribute("data-tag");

		await tagLink.click();

		// Check that visible posts have the tag
		const visiblePosts = page.locator('.post-item:visible, .post-item[style=""]');
		const count = await visiblePosts.count();

		for (let i = 0; i < count; i++) {
			const post = visiblePosts.nth(i);
			const dataTags = await post.getAttribute("data-tags");
			const tags = JSON.parse(dataTags || "[]");
			expect(tags).toContain(tagName);
		}
	});

	test("should highlight active tag", async ({ page }) => {
		const tagLink = page.locator(".post-tag").first();

		await tagLink.click();

		// The clicked tag should have active class
		await expect(tagLink).toHaveClass(/active/);
	});

	test("should update page title with tag name", async ({ page }) => {
		const tagLink = page.locator(".post-tag").first();
		const tagName = await tagLink.getAttribute("data-tag");

		await tagLink.click();

		await expect(page).toHaveTitle(new RegExp(tagName!));
	});

	test("should show no posts message when tag has no matches", async ({
		page,
	}) => {
		// Navigate directly with a non-existent tag
		await page.goto("/blog?tag=nonexistenttag12345");

		const noPosts = page.locator("#no-posts");
		await expect(noPosts).toBeVisible();
		await expect(noPosts).toContainText("No posts found");
	});

	test("should clear filter when navigating back to /blog", async ({
		page,
	}) => {
		// First, filter by a tag
		const tagLink = page.locator(".post-tag").first();
		await tagLink.click();

		const filterHeader = page.locator("#filter-header");
		await expect(filterHeader).toBeVisible();

		// Navigate back to /blog without query params
		await page.goto("/blog");

		// Filter header should be hidden
		await expect(filterHeader).not.toBeVisible();

		// All posts should be visible again
		const postItems = page.locator(".post-item");
		const count = await postItems.count();

		for (let i = 0; i < count; i++) {
			await expect(postItems.nth(i)).toBeVisible();
		}
	});

	test("should handle browser back button", async ({ page }) => {
		// Click a tag to filter
		const tagLink = page.locator(".post-tag").first();
		await tagLink.click();

		await expect(page).toHaveURL(/tag=/);

		// Go back
		await page.goBack();

		// Should be back at /blog without filter
		const filterHeader = page.locator("#filter-header");
		await expect(filterHeader).not.toBeVisible();
	});
});
