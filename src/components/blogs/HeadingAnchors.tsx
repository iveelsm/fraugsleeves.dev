import { useEffect } from "react";

export default function HeadingAnchors() {
	useEffect(() => {
		const anchorLinks = document.querySelectorAll(
			".post-content .heading-anchor",
		);

		const controllers: AbortController[] = [];

		anchorLinks.forEach((anchor) => {
			const controller = new AbortController();
			controllers.push(controller);

			anchor.addEventListener(
				"click",
				async (e) => {
					e.preventDefault();
					const href = anchor.getAttribute("href");
					if (href == null) {
						console.warn(`Detected null href in anchor: ${anchor}`);
						return;
					}

					const url = new URL(href, window.location.href);
					url.hash = href;

					try {
						await navigator.clipboard.writeText(url.toString());
						anchor.classList.add("copied");
						history.pushState(null, "", href);
						setTimeout(() => {
							anchor.classList.remove("copied");
						}, 1500);
					} catch {
						window.location.hash = href;
					}
				},
				{ signal: controller.signal },
			);
		});

		document
			.querySelector(".post-content")
			?.setAttribute("data-hydrated", "");

		return () => {
			controllers.forEach((c) => c.abort());
		};
	}, []);

	return null;
}
