import { useEffect } from "react";

export default function ScrollSpy() {
	useEffect(() => {
		const tocLinks = document.querySelectorAll(".article-toc a");
		const headings = document.querySelectorAll(
			"main h1[id], main h2[id], main h3[id], main h4[id]",
		);

		if (headings.length === 0 || tocLinks.length === 0) {
			return;
		}

		let activeId = "";

		const updateActiveLink = (id: string) => {
			tocLinks.forEach((link) => {
				link.classList.remove("active");
				const href = link.getAttribute("href");
				if (href === `#${id}`) {
					link.classList.add("active");
				}
			});
		};

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
						updateActiveLink(activeId);
					}
				});
			},
			{
				root: null,
				rootMargin: "-80px 0px -70% 0px",
				threshold: 0,
			},
		);

		const checkIfAtBottom = () => {
			const scrollTop =
				window.scrollY || document.documentElement.scrollTop;
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

		headings.forEach((heading) => observer.observe(heading));
		window.addEventListener("scroll", checkIfAtBottom, { passive: true });

		return () => {
			observer.disconnect();
			window.removeEventListener("scroll", checkIfAtBottom);
		};
	}, []);

	return null;
}
