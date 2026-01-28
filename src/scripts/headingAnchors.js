export function initHeadingAnchors() {
	const anchorLinks = document.querySelectorAll(
		".post-content .heading-anchor",
	);

	anchorLinks.forEach((anchor) => {
		anchor.addEventListener("click", async (e) => {
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
				// eslint-disable-next-line  @typescript-eslint/no-unused-vars
			} catch (_err) {
				window.location.hash = href;
			}
		});
	});
}
