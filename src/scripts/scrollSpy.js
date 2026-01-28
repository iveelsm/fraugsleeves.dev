export function initScrollSpy() {
	const tocLinks = document.querySelectorAll(".article-toc a");
	const headings = document.querySelectorAll(
		"main h1[id], main h2[id], main h3[id], main h4[id]",
	);

	if (headings.length === 0 || tocLinks.length === 0) {
		return;
	}

	const observerOptions = {
		root: null,
		rootMargin: "-80px 0px -70% 0px",
		threshold: 0,
	};

	let activeId = "";

	const updateActiveLink = (id) => {
		tocLinks.forEach((link) => {
			link.classList.remove("active");
			const href = link.getAttribute("href");
			if (href === `#${id}`) {
				link.classList.add("active");
			}
		});
	};

	const observerCallback = (entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				activeId = entry.target.id;
				updateActiveLink(activeId);
			}
		});
	};

	const checkIfAtBottom = () => {
		const scrollTop = window.scrollY || document.documentElement.scrollTop;
		const scrollHeight = document.documentElement.scrollHeight;
		const clientHeight = document.documentElement.clientHeight;

		if (scrollTop + clientHeight >= scrollHeight - 50) {
			const lastHeading = headings[headings.length - 1];
			if (lastHeading && lastHeading.id !== activeId) {
				activeId = lastHeading.id;
				updateActiveLink(activeId);
			}
		}
	};

	const observer = new IntersectionObserver(
		observerCallback,
		observerOptions,
	);
	headings.forEach((heading) => observer.observe(heading));
	window.addEventListener("scroll", checkIfAtBottom, {
		passive: true,
	});
}
