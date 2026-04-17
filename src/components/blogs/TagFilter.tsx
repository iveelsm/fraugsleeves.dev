import { useEffect } from "react";

function applyTagFilter() {
	const params = new URLSearchParams(window.location.search);
	const tagFilter = params.get("tag");

	const filterHeader = document.getElementById("filter-header");
	const filterTagName = document.getElementById("filter-tag-name");
	const postsList = document.getElementById("posts-list");
	const noPosts = document.getElementById("no-posts");
	const postItems = document.querySelectorAll(".post-item");
	const tagLinks = document.querySelectorAll(".post-tag");

	if (!filterHeader || !filterTagName || !postsList || !noPosts) {
		console.warn(`There was no selectors found for the filters, disabling`);
		return;
	}

	if (tagFilter) {
		filterHeader.style.display = "flex";
		filterTagName.textContent = tagFilter;
		document.title = `Blog - ${tagFilter}`;
	} else {
		filterHeader.style.display = "none";
		document.title = "Blog";
	}

	let visibleCount = 0;
	postItems.forEach((item) => {
		const el = item as HTMLElement;
		const tags = JSON.parse(el.getAttribute("data-tags") || "[]");
		const isVisible = !tagFilter || tags.includes(tagFilter);
		el.style.display = isVisible ? "" : "none";

		if (isVisible) {
			visibleCount++;
		}
	});

	if (visibleCount === 0) {
		(noPosts as HTMLElement).style.display = "block";
		noPosts.textContent = tagFilter
			? `No posts found for tag "${tagFilter}".`
			: "No posts found.";
		(postsList as HTMLElement).style.display = "none";
	} else {
		(noPosts as HTMLElement).style.display = "none";
		(postsList as HTMLElement).style.display = "";
	}

	tagLinks.forEach((link) => {
		const tag = link.getAttribute("data-tag");
		if (tag === tagFilter) {
			link.classList.add("active");
		} else {
			link.classList.remove("active");
		}
	});
}

export default function TagFilter() {
	useEffect(() => {
		applyTagFilter();

		const postsList = document.getElementById("posts-list");
		postsList?.setAttribute("data-hydrated", "");

		window.addEventListener("popstate", applyTagFilter);
		return () => {
			window.removeEventListener("popstate", applyTagFilter);
		};
	}, []);

	return null;
}
