/**
 * Link Preview - Shows hover previews for external links
 * Uses Microlink API to fetch Open Graph metadata
 */

const CACHE_KEY = "link-preview-cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const HOVER_DELAY = 300; // ms before showing preview

let tooltip = null;
let hoverTimeout = null;
let currentLink = null;
let previewCache = new Map();

function initLinkPreview() {
	// Load cache from localStorage
	loadCache();

	// Create tooltip element
	createTooltip();

	// Find all external links in content
	const contentSelectors = ".post-content, .wayfinder-post";
	const contentElements = document.querySelectorAll(contentSelectors);

	contentElements.forEach((content) => {
		const externalLinks = content.querySelectorAll(
			'a[href^="http"]:not([href*="fraugsleeves.dev"])'
		);

		externalLinks.forEach((link) => {
			link.addEventListener("mouseenter", handleMouseEnter);
			link.addEventListener("mouseleave", handleMouseLeave);
			link.addEventListener("focus", handleMouseEnter);
			link.addEventListener("blur", handleMouseLeave);
		});
	});

	// Hide tooltip when scrolling
	window.addEventListener("scroll", hideTooltip, { passive: true });
}

function createTooltip() {
	if (tooltip) return;

	tooltip = document.createElement("div");
	tooltip.className = "link-preview-tooltip";
	tooltip.setAttribute("role", "tooltip");
	tooltip.setAttribute("aria-hidden", "true");
	document.body.appendChild(tooltip);
}

function handleMouseEnter(event) {
	const link = event.currentTarget;
	currentLink = link;

	clearTimeout(hoverTimeout);
	hoverTimeout = setTimeout(() => {
		showPreview(link);
	}, HOVER_DELAY);
}

function handleMouseLeave() {
	clearTimeout(hoverTimeout);
	currentLink = null;
	hideTooltip();
}

function hideTooltip() {
	if (tooltip) {
		tooltip.classList.remove("visible");
		tooltip.setAttribute("aria-hidden", "true");
	}
}

async function showPreview(link) {
	const url = link.href;

	// Position and show loading state
	positionTooltip(link);
	tooltip.innerHTML = '<div class="link-preview-spinner"></div>';
	tooltip.classList.add("loading", "visible");
	tooltip.setAttribute("aria-hidden", "false");

	try {
		const data = await fetchPreviewData(url);

		// Check if we're still hovering the same link
		if (currentLink !== link) return;

		renderPreview(data, url);
		tooltip.classList.remove("loading");
		positionTooltip(link); // Reposition after content loads
	} catch (error) {
		if (currentLink !== link) return;

		tooltip.innerHTML = `
      <div class="link-preview-error">
        Unable to load preview
      </div>
    `;
		tooltip.classList.remove("loading");
	}
}

async function fetchPreviewData(url) {
	// Check cache first
	const cached = previewCache.get(url);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data;
	}

	// Fetch from Microlink API
	const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
	const response = await fetch(apiUrl);

	if (!response.ok) {
		throw new Error("Failed to fetch preview");
	}

	const result = await response.json();

	if (result.status !== "success") {
		throw new Error("Invalid response");
	}

	const data = result.data;

	// Cache the result
	previewCache.set(url, {
		data,
		timestamp: Date.now(),
	});
	saveCache();

	return data;
}

function renderPreview(data, url) {
	const domain = new URL(url).hostname;
	const favicon = data.logo?.url || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

	tooltip.innerHTML = `
    ${
			data.image?.url
				? `<img class="link-preview-image" src="${escapeHtml(data.image.url)}" alt="" loading="lazy" />`
				: `<div class="link-preview-image placeholder">No preview available</div>`
		}
    <div class="link-preview-content">
      <h4 class="link-preview-title">${escapeHtml(data.title || domain)}</h4>
      ${data.description ? `<p class="link-preview-description">${escapeHtml(data.description)}</p>` : ""}
      <div class="link-preview-domain">
        <img class="link-preview-favicon" src="${escapeHtml(favicon)}" alt="" />
        <span>${escapeHtml(domain)}</span>
      </div>
    </div>
  `;
}

function positionTooltip(link) {
	const rect = link.getBoundingClientRect();
	const tooltipWidth = 320;
	const padding = 12;

	// Calculate position
	let left = rect.left + window.scrollX;
	let top = rect.bottom + window.scrollY + padding;

	// Adjust if tooltip would go off screen to the right
	if (left + tooltipWidth > window.innerWidth - padding) {
		left = window.innerWidth - tooltipWidth - padding;
	}

	// Adjust if tooltip would go off screen to the left
	if (left < padding) {
		left = padding;
	}

	// If tooltip would go below viewport, show above the link
	const tooltipHeight = tooltip.offsetHeight || 250;
	if (rect.bottom + tooltipHeight + padding > window.innerHeight) {
		top = rect.top + window.scrollY - tooltipHeight - padding;
	}

	tooltip.style.left = `${left}px`;
	tooltip.style.top = `${top}px`;
}

function escapeHtml(text) {
	if (!text) return "";
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

function loadCache() {
	try {
		const stored = localStorage.getItem(CACHE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			previewCache = new Map(parsed);
		}
	} catch (e) {
		// Ignore cache errors
	}
}

function saveCache() {
	try {
		// Limit cache size to 50 entries
		if (previewCache.size > 50) {
			const entries = Array.from(previewCache.entries());
			entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
			previewCache = new Map(entries.slice(0, 50));
		}
		localStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(previewCache.entries())));
	} catch (e) {
		// Ignore cache errors
	}
}

// Cleanup function for page transitions
function cleanupLinkPreview() {
	clearTimeout(hoverTimeout);
	hideTooltip();
	currentLink = null;
}

export { initLinkPreview, cleanupLinkPreview };
