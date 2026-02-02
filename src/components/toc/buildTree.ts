import type { Heading } from "./header";

function buildSubtree(
	parent: Heading,
	headings: Heading[],
	startIndex: number,
	parentDepth: number,
): number {
	let consumed = 0;
	let i = startIndex;

	while (i < headings.length) {
		const current = headings[i];
		if (current.depth <= parentDepth) {
			break;
		}

		current.children = [];
		parent.children.push(current);
		consumed++;
		i++;

		const childrenConsumed = buildSubtree(
			current,
			headings,
			i,
			current.depth,
		);
		consumed += childrenConsumed;
		i += childrenConsumed;
	}

	return consumed;
}

/**
 * Builds a tree for the table of contents using the incoming heading array from the markdown
 *
 * @param headings Incoming heading array
 * @returns Subtree with children references
 */
export function buildTree(headings: Heading[]): Heading[] {
	if (!headings || headings.length === 0) {
		return [];
	}

	const toc: Heading[] = [];
	let i = 0;

	while (i < headings.length) {
		const current = headings[i];
		current.children = [];
		toc.push(current);
		i++;

		const consumed = buildSubtree(current, headings, i, current.depth);
		i += consumed;
	}

	return toc;
}
