import { debounce } from "./debounce";
import { performSearch } from "./search";

export function initMobileSearch() {
	const toggle = document.getElementById("mobile-search-toggle");
	const overlay = document.getElementById("search-overlay");
	const overlayClose = document.getElementById("search-overlay-close");
	const overlayInput = document.getElementById("search-overlay-input");
	const overlayResults = document.getElementById("search-overlay-results");

	if (!toggle || !overlay) {
		return;
	}

	const debouncedSearch = debounce(
		(query) => performSearch(query, overlayResults),
		200,
	);

	function openSearch() {
		overlay.classList.add("active");
		document.body.style.overflow = "hidden";
		setTimeout(() => overlayInput?.focus(), 150);
	}

	function closeSearch() {
		overlay.classList.remove("active");
		document.body.style.overflow = "";
		if (overlayInput) overlayInput.value = "";
		if (overlayResults) overlayResults.innerHTML = "";
	}

	toggle.addEventListener("click", openSearch);
	overlayClose?.addEventListener("click", closeSearch);
	overlayInput?.addEventListener("input", (e) =>
		debouncedSearch(e.target.value),
	);

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && overlay.classList.contains("active")) {
			closeSearch();
		}
	});
}
