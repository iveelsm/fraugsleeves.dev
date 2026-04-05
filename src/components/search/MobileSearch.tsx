import { useCallback, useEffect, useRef, useState } from "react";

import { CloseIcon, SearchIcon } from "./icons";
import { usePagefind } from "./usePagefind";

export default function MobileSearch() {
	const [isOpen, setIsOpen] = useState(false);
	const { results, status, search, clear } = usePagefind(10);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		containerRef.current?.setAttribute("data-ready", "");
	}, []);

	const prevOverflowRef = useRef<string>("");

	const open = useCallback(() => {
		setIsOpen(true);
		prevOverflowRef.current = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		setTimeout(() => inputRef.current?.focus(), 150);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
		document.body.style.overflow = prevOverflowRef.current;
		clear();

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}, [clear]);

	useEffect(() => {
		function handleEscape(e: KeyboardEvent) {
			if (e.key === "Escape" && isOpen) {
				close();
			}
		}

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, close]);

	useEffect(() => {
		return () => {
			document.body.style.overflow = prevOverflowRef.current;
		};
	}, []);

	return (
		<div ref={containerRef}>
			<button
				id="mobile-search-toggle"
				className="search-toggle"
				type="button"
				aria-label="Open search"
				aria-expanded={isOpen}
				aria-controls="search-overlay"
				onClick={open}
			>
				<SearchIcon width={18} height={18} />
			</button>

			<div
				id="search-overlay"
				className={`search-overlay${isOpen ? " active" : ""}`}
			>
				<div className="search-overlay-container">
					<div className="search-overlay-header">
						<h1 className="search-overlay-title">Search</h1>
						<button
							id="search-overlay-close"
							className="search-overlay-close"
							type="button"
							aria-label="Close search"
							onClick={close}
						>
							<CloseIcon width={24} height={24} />
						</button>
					</div>
					<div className="search-overlay-form">
						<div className="search-overlay-input-wrapper">
							<SearchIcon
								className="search-overlay-icon"
								width={20}
								height={20}
							/>
							<input
								ref={inputRef}
								id="search-overlay-input"
								type="text"
								className="search-overlay-input"
								placeholder="What are you looking for?"
								autoComplete="off"
								onChange={(e) => search(e.target.value)}
							/>
						</div>
					</div>
					<div
						id="search-overlay-results"
						className="search-overlay-results"
					>
						{status === "error" && (
							<div className="search-no-results">
								Search unavailable
							</div>
						)}
						{status === "no-results" && (
							<div className="search-no-results">
								No results found
							</div>
						)}
						{results.map((result) => (
							<a
								key={result.url}
								href={result.url}
								className="search-result"
							>
								<div className="search-result-title">
									{result.title}
								</div>
								<div
									className="search-result-excerpt"
									dangerouslySetInnerHTML={{
										__html: result.excerpt,
									}}
								/>
							</a>
						))}
					</div>
					<div className="search-overlay-hint">
						<p>
							Try searching for topics like &quot;golang&quot;,
							&quot;microservices&quot;, or &quot;context&quot;
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
