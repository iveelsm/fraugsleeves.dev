import { describe, it, expect } from "vitest";
import { buildTree } from "../../../src/components/toc/buildTree";
import type { Heading } from "../../../src/components/toc/header";
import { collectTexts, countHeadings, h } from "./headingUtilties";

describe("buildTree", () => {
	describe("empty and null inputs", () => {
		it("should return empty array for undefined input", () => {
			const result = buildTree(undefined as unknown as Heading[]);
			expect(result).toEqual([]);
		});

		it("should return empty array for empty input", () => {
			const result = buildTree([]);
			expect(result).toEqual([]);
		});
	});

	describe("flat headings (same depth)", () => {
		it("should handle a single heading", () => {
			const headings = [h(2, "Introduction")];
			const result = buildTree(headings);

			expect(result).toHaveLength(1);
			expect(result[0].text).toBe("Introduction");
			expect(result[0].children).toHaveLength(0);
		});

		it("should handle multiple h2 headings without nesting", () => {
			const headings = [
				h(2, "Section One"),
				h(2, "Section Two"),
				h(2, "Section Three"),
			];
			const result = buildTree(headings);

			expect(result).toHaveLength(3);
			expect(result[0].text).toBe("Section One");
			expect(result[1].text).toBe("Section Two");
			expect(result[2].text).toBe("Section Three");
			expect(result.every((h) => h.children.length === 0)).toBe(true);
		});
	});

	describe("simple nested headings", () => {
		it("should nest an h3 under an h2", () => {
			const headings = [h(2, "Parent"), h(3, "Child")];
			const result = buildTree(headings);

			expect(result).toHaveLength(1);
			expect(result[0].text).toBe("Parent");
			expect(result[0].children).toHaveLength(1);
			expect(result[0].children[0].text).toBe("Child");
		});

		it("should nest multiple h3s under an h2", () => {
			const headings = [
				h(2, "Parent"),
				h(3, "Child One"),
				h(3, "Child Two"),
			];
			const result = buildTree(headings);

			expect(result).toHaveLength(1);
			expect(result[0].text).toBe("Parent");
			expect(result[0].children).toHaveLength(2);
			expect(result[0].children[0].text).toBe("Child One");
			expect(result[0].children[1].text).toBe("Child Two");
		});
	});

	describe("deeply nested headings", () => {
		it("should handle h2 > h3 > h4 nesting", () => {
			const headings = [
				h(2, "Level 2"),
				h(3, "Level 3"),
				h(4, "Level 4"),
			];
			const result = buildTree(headings);

			expect(result).toHaveLength(1);
			expect(result[0].text).toBe("Level 2");
			expect(result[0].children).toHaveLength(1);
			expect(result[0].children[0].text).toBe("Level 3");
			expect(result[0].children[0].children).toHaveLength(1);
			expect(result[0].children[0].children[0].text).toBe("Level 4");
		});

		it("should handle h2 > h3 > h4 > h5 nesting", () => {
			const headings = [
				h(2, "Level 2"),
				h(3, "Level 3"),
				h(4, "Level 4"),
				h(5, "Level 5"),
			];
			const result = buildTree(headings);

			expect(result).toHaveLength(1);
			expect(result[0].children).toHaveLength(1);
			expect(result[0].children[0].children).toHaveLength(1);
			expect(result[0].children[0].children[0].children).toHaveLength(1);
			expect(result[0].children[0].children[0].children[0].text).toBe(
				"Level 5",
			);
		});
	});

	describe("complex mixed structures", () => {
		it("should handle h2, h3, h3, h2 pattern", () => {
			const headings = [
				h(2, "First Section"),
				h(3, "Subsection A"),
				h(3, "Subsection B"),
				h(2, "Second Section"),
			];
			const result = buildTree(headings);

			expect(result).toHaveLength(2);
			expect(result[0].text).toBe("First Section");
			expect(result[0].children).toHaveLength(2);
			expect(result[1].text).toBe("Second Section");
			expect(result[1].children).toHaveLength(0);
		});

		it("should handle h2, h3, h4, h3, h2 pattern", () => {
			const headings = [
				h(2, "Section One"),
				h(3, "Sub One"),
				h(4, "Deep One"),
				h(3, "Sub Two"),
				h(2, "Section Two"),
			];
			const result = buildTree(headings);

			expect(result).toHaveLength(2);
			expect(result[0].text).toBe("Section One");
			expect(result[0].children).toHaveLength(2);
			expect(result[0].children[0].text).toBe("Sub One");
			expect(result[0].children[0].children).toHaveLength(1);
			expect(result[0].children[0].children[0].text).toBe("Deep One");
			expect(result[0].children[1].text).toBe("Sub Two");
			expect(result[1].text).toBe("Section Two");
		});

		it("should handle real blog post structure", () => {
			const headings = [
				h(2, "Introduction"),
				h(2, "Getting Started"),
				h(3, "Prerequisites"),
				h(3, "Installation"),
				h(4, "macOS"),
				h(4, "Linux"),
				h(4, "Windows"),
				h(2, "Basic Usage"),
				h(3, "Configuration"),
				h(3, "Running"),
				h(2, "Conclusion"),
			];
			const result = buildTree(headings);

			expect(result).toHaveLength(4);
			expect(result[0].text).toBe("Introduction");
			expect(result[0].children).toHaveLength(0);

			expect(result[1].text).toBe("Getting Started");
			expect(result[1].children).toHaveLength(2);
			expect(result[1].children[1].children).toHaveLength(3);

			expect(result[2].text).toBe("Basic Usage");
			expect(result[2].children).toHaveLength(2);

			expect(result[3].text).toBe("Conclusion");
		});
	});

	describe("headings should not appear twice", () => {
		it("should not duplicate headings in the tree", () => {
			const headings = [
				h(2, "Parent"),
				h(3, "Child One"),
				h(3, "Child Two"),
			];
			const result = buildTree(headings);

			const totalInTree = countHeadings(result);
			expect(totalInTree).toBe(headings.length);
		});

		it("should not duplicate deeply nested headings", () => {
			const headings = [
				h(2, "A"),
				h(3, "B"),
				h(4, "C"),
				h(3, "D"),
				h(2, "E"),
			];
			const result = buildTree(headings);

			const totalInTree = countHeadings(result);
			expect(totalInTree).toBe(headings.length);

			const texts = collectTexts(result);
			expect(texts.sort()).toEqual(["A", "B", "C", "D", "E"]);
		});

		it("should preserve order and not duplicate in complex structure", () => {
			const headings = [
				h(2, "Section 1"),
				h(3, "Sub 1.1"),
				h(4, "Sub 1.1.1"),
				h(4, "Sub 1.1.2"),
				h(3, "Sub 1.2"),
				h(2, "Section 2"),
				h(3, "Sub 2.1"),
			];
			const result = buildTree(headings);

			const totalInTree = countHeadings(result);
			expect(totalInTree).toBe(headings.length);

			const texts = collectTexts(result);
			expect(texts).toEqual([
				"Section 1",
				"Sub 1.1",
				"Sub 1.1.1",
				"Sub 1.1.2",
				"Sub 1.2",
				"Section 2",
				"Sub 2.1",
			]);
		});

		it("should handle consecutive deep nesting without duplication", () => {
			const headings = [
				h(2, "H2"),
				h(3, "H3"),
				h(4, "H4"),
				h(5, "H5"),
				h(6, "H6"),
			];
			const result = buildTree(headings);

			const totalInTree = countHeadings(result);
			expect(totalInTree).toBe(5);
		});

		it("should not duplicate when returning to higher levels", () => {
			const headings = [
				h(2, "A"),
				h(3, "B"),
				h(4, "C"),
				h(2, "D"),
				h(3, "E"),
				h(4, "F"),
			];
			const result = buildTree(headings);

			const totalInTree = countHeadings(result);
			expect(totalInTree).toBe(6);

			const texts = collectTexts(result);
			expect(texts).toEqual(["A", "B", "C", "D", "E", "F"]);
		});
	});

	describe("edge cases", () => {
		it("should handle skipped levels (h2 directly to h4)", () => {
			const headings = [h(2, "Section"), h(4, "Deep Child")];
			const result = buildTree(headings);

			expect(result).toHaveLength(1);
			expect(result[0].text).toBe("Section");
			expect(result[0].children).toHaveLength(1);
			expect(result[0].children[0].text).toBe("Deep Child");
		});

		it("should handle starting with h3 instead of h2", () => {
			const headings = [h(3, "First"), h(4, "Nested")];
			const result = buildTree(headings);

			expect(result).toHaveLength(1);
			expect(result[0].text).toBe("First");
			expect(result[0].children).toHaveLength(1);
		});
	});
});
