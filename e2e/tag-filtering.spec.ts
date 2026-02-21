import { test, expect } from "@playwright/test";

test.describe("Tag filtering should...", { tag: ["@desktop", "@mobile"] }, () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/blog");
	});

	test("display all posts by default", async ({ page }) => {
		const postsList = page.locator("#posts-list");
		const postItems = page.locator(".post-item");

		await expect(postsList).toBeVisible();
		const count = await postItems.count();
		expect(count).toBeGreaterThan(0);
		for (let i = 0; i < count; i++) {
			await expect(postItems.nth(i)).toBeVisible();
		}
	});

	test("not show filter header by default", async ({ page }) => {
		const filterHeader = page.locator("#filter-header");
		await expect(filterHeader).not.toBeVisible();
	});

	test("filter posts when clicking a tag", async ({ page }) => {
		const tagLink = page.locator(".post-tag").first();
		const tagName = await tagLink.getAttribute("data-tag");

		await tagLink.click();

		await expect(page).toHaveURL(new RegExp(`tag=${tagName}`));
		const filterHeader = page.locator("#filter-header");
		await expect(filterHeader).toBeVisible();
		const filterTagName = page.locator("#filter-tag-name");
		await expect(filterTagName).toHaveText(tagName!);
	});

	test("show only posts with selected tag", async ({ page }) => {
		const tagLink = page.locator(".post-tag").first();
		const tagName = await tagLink.getAttribute("data-tag");

		await tagLink.click();
		const visiblePosts = page.locator('.post-item:visible, .post-item[style=""]');
		const count = await visiblePosts.count();

		for (let i = 0; i < count; i++) {
			const post = visiblePosts.nth(i);
			const dataTags = await post.getAttribute("data-tags");
			const tags = JSON.parse(dataTags || "[]");
			expect(tags).toContain(tagName);
		}
	});

	test("highlight active tag", async ({ page }) => {
		const tagLink = page.locator(".post-tag").first();

		await tagLink.click();
		await expect(tagLink).toHaveClass(/active/);
	});

	test("update page title with tag name", async ({ page }) => {
		const tagLink = page.locator(".post-tag").first();
		const tagName = await tagLink.getAttribute("data-tag");

		await tagLink.click();
		await expect(page).toHaveTitle(new RegExp(tagName!));
	});

	test("show no posts message when tag has no matches", async ({ page }) => {
		await page.goto("/blog?tag=nonexistenttag12345");

		const noPosts = page.locator("#no-posts");
		await expect(noPosts).toBeVisible();
		await expect(noPosts).toContainText("No posts found");
	});

	test("clear filter when navigating back to /blog", async ({ page }) => {
		const tagLink = page.locator(".post-tag").first();
		await tagLink.click();

		const filterHeader = page.locator("#filter-header");
		await expect(filterHeader).toBeVisible();

		await page.goto("/blog");
		await expect(filterHeader).not.toBeVisible();

		// All posts should be visible again
		const postItems = page.locator(".post-item");
		const count = await postItems.count();

		for (let i = 0; i < count; i++) {
			await expect(postItems.nth(i)).toBeVisible();
		}
	});

	test("should handle browser back button", async ({ page }) => {
		const tagLink = page.locator(".post-tag").first();
		await tagLink.click();

		await expect(page).toHaveURL(/tag=/);
		await page.goBack();

		// Should be back at /blog without filter
		const filterHeader = page.locator("#filter-header");
		await expect(filterHeader).not.toBeVisible();
	});
});
