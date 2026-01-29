/**
 * Parses simple inline markdown formatting in text.
 * Supports: **bold**, *italic*, ~~strikethrough~~
 *
 * Note: This is intentionally limited to simple formatting.
 * For security, it escapes HTML before processing markdown.
 */
export function formatText(title: string): string {
	let formatted = title
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");

	formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
	formatted = formatted.replace(/__(.+?)__/g, "<strong>$1</strong>");
	formatted = formatted.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>");
	formatted = formatted.replace(/(?<!_)_([^_]+?)_(?!_)/g, "<em>$1</em>");
	formatted = formatted.replace(/~~(.+?)~~/g, "<del>$1</del>");
	formatted = formatted.replace(/`([^`]+?)`/g, "<code>$1</code>");

	return formatted;
}
