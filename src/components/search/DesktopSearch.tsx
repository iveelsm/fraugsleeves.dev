import { useCallback, useEffect, useRef, useState } from "react";

import { CloseIcon, SearchIcon } from "./icons";
import { usePagefind } from "./usePagefind";

export default function DesktopSearch() {
	const [isOpen, setIsOpen] = useState(false);
	const { results, status, search, clear } = usePagefind(5);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		containerRef.current?.setAttribute("data-ready", "");
	}, []);

	const open = useCallback(() => {
		setIsOpen(true);
		setTimeout(() => inputRef.current?.focus(), 150);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
		clear();

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}, [clear]);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				isOpen &&
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				close();
			}
		}

		function handleEscape(e: KeyboardEvent) {
			if (e.key === "Escape" && isOpen) {
				close();
			}
		}

		document.addEventListener("click", handleClickOutside);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("click", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, close]);

	const hasDropdown = results.length > 0 || status !== "idle";

	return (
		<div
			ref={containerRef}
			id="search-container"
			className={`search-container${isOpen ? " search-open" : ""}`}
		>
			<button
				id="search-toggle"
				className="search-toggle"
				type="button"
				aria-label="Open search"
				aria-expanded={isOpen}
				onClick={open}
				style={
					isOpen
						? {
								opacity: 0,
								transform: "scale(0.8)",
								pointerEvents: "none" as const,
							}
						: {
								opacity: 1,
								transform: "scale(1)",
								pointerEvents: "auto" as const,
							}
				}
			>
				<SearchIcon width={18} height={18} />
			</button>

			<div
				id="search-input-wrapper"
				className="search-input-wrapper search-desktop"
			>
				<SearchIcon
					className="search-input-icon"
					width={16}
					height={16}
				/>
				<input
					ref={inputRef}
					id="search-input"
					type="text"
					className="search-input"
					placeholder="Search..."
					autoComplete="off"
					onChange={(e) => search(e.target.value)}
				/>
				<button
					id="search-clear"
					className="search-clear"
					type="button"
					aria-label="Close search"
					onClick={close}
				>
					<CloseIcon width={16} height={16} />
				</button>
			</div>

			<div
				id="search-dropdown"
				className={`search-dropdown search-desktop${hasDropdown ? " visible" : ""}`}
			>
				<div id="search-results" className="search-results">
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
			</div>
		</div>
	);
}
