export async function performSearch(pf, query, resultsContainer) {
	if (!resultsContainer) {
		return;
	}

	if (!query.trim()) {
		resultsContainer.innerHTML = "";
		return;
	}

	if (!pf) {
		resultsContainer.innerHTML =
			'<div class="search-no-results">Search unavailable</div>';
		return;
	}

	const search = await pf.search(query);
	if (search.results.length === 0) {
		resultsContainer.innerHTML =
			'<div class="search-no-results">No results found</div>';
		return;
	}

	const results = await Promise.all(
		search.results.slice(0, 10).map((r) => r.data()),
	);

	resultsContainer.innerHTML = results
		.map(
			(result) => `
	<a href="${result.url}" class="search-result">
		<div class="search-result-title">${result.meta?.title || result.meta?.name || result.title || result.url}</div>
		<div class="search-result-excerpt">${result.excerpt}</div>
	</a>
`,
		)
		.join("");
}
