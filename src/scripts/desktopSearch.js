import { debounce } from "./debounce";
import { performSearch } from "./search";

export async function initDesktopSearch() {
	const pagefind = await import("/pagefind/pagefind.js");

	const container = document.querySelector(
		".toolbar-desktop .search-container",
	);
	if (!container) {
		return;
	}

	const toggle = container.querySelector(".search-toggle");
	const input = container.querySelector(".search-input");
	const clearBtn = container.querySelector(".search-clear");
	const dropdown = container.querySelector(".search-dropdown");
	const resultsContainer = container.querySelector(".search-results");

	if (!toggle) {
		return;
	}

	const debouncedSearch = debounce(
		() => {
			(query) => performSearch(pagefind, query, resultsContainer)
		},
		200,
	);

	let isOpen = false;

	function openSearch() {
		isOpen = true;
		container.classList.add("search-open");
		toggle.style.opacity = "0";
		toggle.style.transform = "scale(0.8)";
		toggle.style.pointerEvents = "none";
		setTimeout(() => input?.focus(), 150);
	}

	function closeSearch() {
		isOpen = false;
		container.classList.remove("search-open");
		toggle.style.opacity = "1";
		toggle.style.transform = "scale(1)";
		toggle.style.pointerEvents = "auto";
		if (input) input.value = "";
		dropdown?.classList.remove("visible");
		if (resultsContainer) resultsContainer.innerHTML = "";
	}

	toggle.addEventListener("click", openSearch);
	clearBtn?.addEventListener("click", closeSearch);
	input?.addEventListener("input", (e) =>
		debouncedSearch(e.target.value),
	);

	document.addEventListener("click", (e) => {
		if (isOpen && !container.contains(e.target)) {
			closeSearch();
		}
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && isOpen) {
			closeSearch();
		}
	});
}
