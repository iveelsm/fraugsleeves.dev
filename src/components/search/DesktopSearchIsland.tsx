import { useCallback, useRef, useState } from "react";

import { CloseIcon, SearchIcon } from "./icons";
import { usePagefind } from "./usePagefind";

export default function DesktopSearchIsland() {
	const [isOpen, setIsOpen] = useState(false);
	const { results, status, search, clear } = usePagefind(5);
	const inputRef = useRef<HTMLInputElement>(null);

	const close = useCallback(() => {
		setIsOpen(false);
		clear();

		const container = document.getElementById("search-container");
		const toggle = document.getElementById("search-toggle");
		container?.classList.remove("search-open");
		container?.style.removeProperty("position");
		container?.style.removeProperty("z-index");
		toggle?.setAttribute("aria-expanded", "false");
		toggle?.style.removeProperty("opacity");
		toggle?.style.removeProperty("transform");
		toggle?.style.removeProperty("pointer-events");

		if (inputRef.current) {
			inputRef.current.value = "";
		}
	}, [clear]);

	const open = useCallback(() => {
		setIsOpen(true);

		const container = document.getElementById("search-container");
		const toggle = document.getElementById("search-toggle");
		container?.classList.add("search-open");
		container?.style.setProperty("position", "relative");
		container?.style.setProperty("z-index", "300");
		toggle?.setAttribute("aria-expanded", "true");
		toggle?.style.setProperty("opacity", "0");
		toggle?.style.setProperty("transform", "scale(0.8)");
		toggle?.style.setProperty("pointer-events", "none");

		container?.focus();
		setTimeout(() => inputRef.current?.focus(), 150);
	}, []);

	const wrapperRef = useCallback(
		(el: HTMLDivElement | null) => {
			if (!el) return;
			const toggle = document.getElementById("search-toggle");
			toggle?.addEventListener("click", open);
		},
		[open],
	);

	if (!isOpen) {
		return <div ref={wrapperRef} />;
	}

	return (
		<div
			ref={wrapperRef}
			tabIndex={-1}
			onKeyDown={(e) => {
				if (e.key === "Escape") close();
			}}
		>
			<div
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 299,
				}}
				onClick={close}
			/>
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
				className={`search-dropdown search-desktop${results.length > 0 || status !== "idle" ? " visible" : ""}`}
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
