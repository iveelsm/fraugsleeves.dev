import type { Heading } from "./header";

function buildSubtree(
	parent: Heading,
	headings: Heading[],
	offset: number,
	depth: number,
): number {
	if (offset == headings.length) {
		return 0;
	}

	let increment = 0;
	let next = offset + 1;
	while (next < headings.length && headings[offset].depth >= depth) {
		let current = headings[offset];
		current.children = [];
		parent.children = [...parent.children, current];

		if (headings[next].depth != depth) {
			increment += buildSubtree(
				current,
				headings,
				next,
				current.depth + 1,
			);
			next += increment;
		}

		offset = next;
		next++;
		increment++;
	}

	return increment;
}

export function buildTree(headings: Heading[]): Heading[] {
	if (!headings) {
		return [];
	}

	const toc: Heading[] = [];

	let tree = 0;
	let i = 0;
	while (i < headings.length) {
		toc[tree] = headings[i];
		toc[tree].children = [];
		i += buildSubtree(toc[tree], headings, i + 1, headings[i].depth + 1);
		i++;
		tree++;
	}

	return toc;
}
