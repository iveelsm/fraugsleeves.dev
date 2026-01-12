/**
 * Initialize header collapse behavior on scroll
 */
function initHeaderCollapse() {
	const header = document.querySelector(".post-header-fixed");
	const collapseThreshold = 10; // Collapse summary/tags after small scroll
	const hideThreshold = window.innerHeight / 2; // Fully hide after half window

	const handleScroll = () => {
		if (window.scrollY > hideThreshold) {
			header?.classList.add("hidden");
			header?.classList.add("collapsed");
		} else if (window.scrollY > collapseThreshold) {
			header?.classList.remove("hidden");
			header?.classList.add("collapsed");
		} else {
			header?.classList.remove("hidden");
			header?.classList.remove("collapsed");
		}
	};

	window.addEventListener("scroll", handleScroll, { passive: true });
	handleScroll(); // Check initial state
}

/**
 * Initialize scroll spy to highlight active TOC item
 */
function initScrollSpy() {
	const tocLinks = document.querySelectorAll(".article-toc a");
	const headings = document.querySelectorAll(
		"main h1[id], main h2[id], main h3[id], main h4[id]",
	);

	if (headings.length === 0 || tocLinks.length === 0) return;

	const observerOptions = {
		root: null,
		rootMargin: "-80px 0px -70% 0px",
		threshold: 0,
	};

	let activeId = "";

	const observerCallback = (entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				activeId = entry.target.id;
				updateActiveLink();
			}
		});
	};

	const updateActiveLink = () => {
		tocLinks.forEach((link) => {
			link.classList.remove("active");
			const href = link.getAttribute("href");
			if (href === `#${activeId}`) {
				link.classList.add("active");
			}
		});
	};

	const observer = new IntersectionObserver(
		observerCallback,
		observerOptions,
	);
	headings.forEach((heading) => observer.observe(heading));
}

/**
 * Initialize all blog post functionality
 */
function initBlogPost() {
	initHeaderCollapse();
	initScrollSpy();
}

// Run on DOM ready
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initBlogPost);
} else {
	initBlogPost();
}

// Re-initialize on Astro page transitions
document.addEventListener("astro:page-load", initBlogPost);
