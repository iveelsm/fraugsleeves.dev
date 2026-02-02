import { Heading } from "../../../src/components/toc/header";

export function h(depth: number, text: string, slug?: string): Heading {
	return {
		depth,
		text,
		slug: slug ?? text.toLowerCase().replace(/\s+/g, "-"),
		children: [],
	};
}

export function countHeadings(headings: Heading[]): number {
	let count = 0;
	for (const heading of headings) {
		count++;
		if (heading.children.length > 0) {
			count += countHeadings(heading.children);
		}
	}
	return count;
}

export function collectTexts(headings: Heading[]): string[] {
	const texts: string[] = [];
	for (const heading of headings) {
		texts.push(heading.text);
		if (heading.children.length > 0) {
			texts.push(...collectTexts(heading.children));
		}
	}
	return texts;
}
