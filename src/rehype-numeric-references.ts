import type { Root, Element, Text } from "hast";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin to wrap numeric references (e.g., [1], [2], [3]) in a span
 * with a class for superscript styling.
 */
export default function rehypeNumericReferences() {
	return (tree: Root) => {
		visit(tree, "element", (node: Element) => {
			if (
				node.tagName === "a" &&
				node.children &&
				node.children.length > 0
			) {
				const firstChild = node.children[0];

				if (
					firstChild.type === "text" &&
					/^\[\d+\]$/.test((firstChild as Text).value)
				) {
					node.properties = node.properties || {};
					const existingClasses = node.properties.className;
					let classArray: string[];

					if (Array.isArray(existingClasses)) {
						classArray = existingClasses.filter(
							(c): c is string => typeof c === "string",
						);
					} else if (typeof existingClasses === "string") {
						classArray = [existingClasses];
					} else {
						classArray = [];
					}

					node.properties.className = [
						...classArray,
						"numeric-reference",
					];
				}
			}
		});
	};
}
