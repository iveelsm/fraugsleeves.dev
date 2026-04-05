import { useCallback, useEffect, useRef, useState } from "react";

interface SearchResult {
	url: string;
	title: string;
	excerpt: string;
}

interface PagefindResult {
	url: string;
	excerpt: string;
	meta?: { title?: string; name?: string };
	title?: string;
}

interface Pagefind {
	init: () => Promise<void>;
	search: (
		query: string,
	) => Promise<{ results: { data: () => Promise<PagefindResult> }[] }>;
}

export function usePagefind(maxResults: number = 5) {
	const pagefindRef = useRef<Pagefind | null>(null);
	const [results, setResults] = useState<SearchResult[]>([]);
	const [status, setStatus] = useState<"idle" | "no-results" | "error">(
		"idle",
	);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const loadPagefind = useCallback(async (): Promise<Pagefind | null> => {
		if (pagefindRef.current) {
			return pagefindRef.current;
		}

		try {
			const pagefindPath = "/pagefind/pagefind.js";
			const pf = await import(/* @vite-ignore */ pagefindPath);
			await pf.init();
			pagefindRef.current = pf;
			return pf;
		} catch {
			return null;
		}
	}, []);

	const search = useCallback(
		(query: string) => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}

			if (!query.trim()) {
				setResults([]);
				setStatus("idle");
				return;
			}

			debounceRef.current = setTimeout(async () => {
				try {
					const pf = await loadPagefind();
					if (!pf) {
						setResults([]);
						setStatus("error");
						return;
					}

					const searchResponse = await pf.search(query);

					if (searchResponse.results.length === 0) {
						setResults([]);
						setStatus("no-results");
						return;
					}

					const data = await Promise.all(
						searchResponse.results
							.slice(0, maxResults)
							.map((r) => r.data()),
					);

					setResults(
						data.map((r) => ({
							url: r.url,
							title:
								r.meta?.title ||
								r.meta?.name ||
								r.title ||
								r.url,
							excerpt: r.excerpt,
						})),
					);
					setStatus("idle");
				} catch {
					setResults([]);
					setStatus("error");
				}
			}, 200);
		},
		[loadPagefind, maxResults],
	);

	const clear = useCallback(() => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}
		setResults([]);
		setStatus("idle");
	}, []);

	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	return { results, status, search, clear };
}
