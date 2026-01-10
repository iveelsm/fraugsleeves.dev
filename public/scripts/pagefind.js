let pagefind = null;

/**
 * Load Pagefind dynamically at runtime
 * @returns {Promise<any>} The pagefind instance
 */
async function loadPagefind() {
	if (pagefind) return pagefind;
	try {
		pagefind = await import('/pagefind/pagefind.js');
		await pagefind.init();
		return pagefind;
	} catch (e) {
		console.error('Failed to load Pagefind:', e);
		return null;
	}
}

/**
 * Perform a search query and render results
 * @param {string} query - The search query
 * @param {HTMLElement} dropdown - The dropdown container element
 * @param {HTMLElement} resultsContainer - The results container element
 */
async function performSearch(query, dropdown, resultsContainer) {
	if (!query.trim()) {
		dropdown.classList.remove('visible');
		resultsContainer.innerHTML = '';
		return;
	}

	const pf = await loadPagefind();
	if (!pf) {
		resultsContainer.innerHTML = '<div class="search-no-results">Search unavailable</div>';
		dropdown.classList.add('visible');
		return;
	}

	const search = await pf.search(query);
	
	if (search.results.length === 0) {
		resultsContainer.innerHTML = '<div class="search-no-results">No results found</div>';
		dropdown.classList.add('visible');
		return;
	}

	// Load first 5 results
	const results = await Promise.all(
		search.results.slice(0, 5).map(r => r.data())
	);

	resultsContainer.innerHTML = results.map(result => `
		<a href="${result.url}" class="search-result">
			<div class="search-result-title">${result.meta?.title || result.url}</div>
			<div class="search-result-excerpt">${result.excerpt}</div>
		</a>
	`).join('');

	dropdown.classList.add('visible');
}

/**
 * Create a debounced search function
 * @param {HTMLElement} dropdown - The dropdown container element
 * @param {HTMLElement} resultsContainer - The results container element
 * @returns {function(string): void} Debounced search function
 */
function createDebouncedSearch(dropdown, resultsContainer) {
	let searchTimeout;
	return function debouncedSearch(query) {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => performSearch(query, dropdown, resultsContainer), 200);
	};
}

/**
 * Initialize the search functionality
 */
function initSearch() {
	const container = document.getElementById('search-container');
	const toggle = document.getElementById('search-toggle');
	const inputWrapper = document.getElementById('search-input-wrapper');
	const input = document.getElementById('search-input');
	const clearBtn = document.getElementById('search-clear');
	const dropdown = document.getElementById('search-dropdown');
	const resultsContainer = document.getElementById('search-results');

	if (!container || !toggle || !inputWrapper || !input || !clearBtn || !dropdown || !resultsContainer) return;

	const debouncedSearch = createDebouncedSearch(dropdown, resultsContainer);

	function openSearch() {
		container.classList.add('expanded');
		toggle.setAttribute('aria-expanded', 'true');
		setTimeout(() => input.focus(), 100);
	}

	function closeSearch() {
		container.classList.remove('expanded');
		toggle.setAttribute('aria-expanded', 'false');
		input.value = '';
		dropdown.classList.remove('visible');
		resultsContainer.innerHTML = '';
	}

	// Event listeners
	toggle.addEventListener('click', openSearch);
	clearBtn.addEventListener('click', closeSearch);
	
	input.addEventListener('input', (e) => {
		debouncedSearch(e.target.value);
	});

	// Close on click outside
	document.addEventListener('click', (e) => {
		if (!container.contains(e.target) && container.classList.contains('expanded')) {
			closeSearch();
		}
	});

	// Keyboard shortcuts
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && container.classList.contains('expanded')) {
			closeSearch();
		}
	});

	// Close dropdown when clicking a result
	resultsContainer.addEventListener('click', () => {
		closeSearch();
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initSearch);
} else {
	initSearch();
}

// Re-initialize on Astro page transitions
document.addEventListener('astro:page-load', initSearch);
