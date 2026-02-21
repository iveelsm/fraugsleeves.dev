#!/usr/bin/env node
/**
 * generate-theme.mjs
 *
 * Generates uchu-theme.json from the uchu color palette.
 * All color choices live in the PALETTE section below.
 * To change a color, update it here and re-run:
 *
 *   node src/themes/generate-theme.mjs
 */

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// PALETTE
// Each entry maps a semantic role to a hex value from the uchu color system.
// Only modify values here — see README.md Color Mapping for valid hex values.
// ---------------------------------------------------------------------------
const PALETTE = {
	// Base
	background:  "#202225", // uchu-yin-9
	foreground:  "#e3e5e5", // uchu-gray-2
	comment:     "#9b9b9d", // uchu-gray-7
	punctuation: "#cbcdcd", // uchu-gray-4

	// Syntax
	red:         "#ea3c65", // uchu-red-4    — keywords, storage, operators
	pink:        "#f59cb1", // uchu-red-2    — invalid/error tokens
	purple:      "#ac83de", // uchu-purple-3 — functions, classes, decorators
	blue:        "#3984f2", // uchu-blue-4   — constants, numbers, headings
	blueLight:   "#6aa2f5", // uchu-blue-3   — strings, types, support, meta
	blueLighter: "#ccdefc", // uchu-blue-1   — regex, links
	green:       "#64d970", // uchu-green-4  — tags, escape chars, diff insert
	orange:      "#ffb783", // uchu-orange-3 — parameters, markdown list

	// Diff backgrounds
	diffDeletedBg: "#8c0c2b", // uchu-red-9
	diffInsertedBg: "#297f34", // uchu-green-9
	diffChangedBg:  "#9c5524", // uchu-orange-9
};

// ---------------------------------------------------------------------------
// THEME DEFINITION
// ---------------------------------------------------------------------------
const theme = {
	name: "uchu",
	type: "dark",
	colors: {
		"editor.background": PALETTE.background,
		"editor.foreground": PALETTE.foreground,
	},
	settings: [
		// Global defaults
		{
			settings: {
				foreground: PALETTE.foreground,
				background: PALETTE.background,
			},
		},

		// --- Comments ---
		{
			name: "Comments",
			scope: "comment, punctuation.definition.comment, string.comment",
			settings: { foreground: PALETTE.comment, fontStyle: "italic" },
		},

		// --- Strings ---
		{
			name: "Strings",
			scope: "string, string.quoted, string.template, punctuation.definition.string",
			settings: { foreground: PALETTE.blueLight },
		},
		{
			name: "Template Literal Variables",
			scope: "string variable",
			settings: { foreground: PALETTE.blueLight },
		},
		{
			name: "Module Names",
			scope: "string.quoted.module",
			settings: { foreground: PALETTE.blueLight },
		},

		// --- Numbers & Constants ---
		{
			name: "Numbers",
			scope: "constant.numeric",
			settings: { foreground: PALETTE.blue },
		},
		{
			name: "Booleans and Language Constants",
			scope: "constant.language, constant.language.boolean, variable.language",
			settings: { foreground: PALETTE.blue },
		},
		{
			name: "Constants and Enums",
			scope: "constant, entity.name.constant, variable.other.constant, variable.other.enummember",
			settings: { foreground: PALETTE.blueLight },
		},
		{
			name: "Support Constants",
			scope: "support.constant",
			settings: { foreground: PALETTE.blue },
		},
		{
			name: "Support Variables",
			scope: "support.variable",
			settings: { foreground: PALETTE.blueLight },
		},
		{
			name: "Meta Property Name",
			scope: "meta.property-name",
			settings: { foreground: PALETTE.blueLight },
		},

		// --- Keywords & Storage ---
		{
			name: "Keywords",
			scope: [
				"keyword",
				"keyword.control",
				"keyword.operator.new",
				"keyword.operator.expression",
				"keyword.operator.logical",
				"keyword.operator.sizeof",
				"keyword.operator.address",
				"keyword.operator.bitwise",
				"storage.type",
				"storage.modifier",
			].join(", "),
			settings: { foreground: PALETTE.red },
		},
		{
			name: "Storage Modifier Import Exception",
			scope: "storage.modifier.package, storage.modifier.import",
			settings: { foreground: PALETTE.foreground },
		},
		{
			name: "Import/Export",
			scope: "keyword.control.import, keyword.control.export, keyword.control.from, keyword.control.as",
			settings: { foreground: PALETTE.red },
		},

		// --- Operators ---
		{
			name: "Operators",
			scope: "keyword.operator.assignment, keyword.operator.arithmetic, keyword.operator.comparison, punctuation.accessor",
			settings: { foreground: PALETTE.foreground },
		},
		{
			name: "Address and Pointer Operators",
			scope: [
				"keyword.operator.address",
				"keyword.operator.bitwise",
				"storage.modifier.pointer",
				"storage.modifier.reference",
				"keyword.operator.address-of",
				"punctuation.definition.pointer",
				"keyword.operator.dereference",
			].join(", "),
			settings: { foreground: PALETTE.red },
		},

		// --- Functions ---
		{
			name: "Functions",
			scope: "entity.name.function, support.function",
			settings: { foreground: PALETTE.purple },
		},
		{
			name: "Decorators",
			scope: "meta.decorator, punctuation.decorator",
			settings: { foreground: PALETTE.purple },
		},

		// --- Variables ---
		{
			name: "Variables",
			scope: "variable",
			settings: { foreground: PALETTE.foreground },
		},
		{
			name: "Function Parameters",
			scope: "variable.parameter, variable.parameter.function, meta.parameter",
			settings: { foreground: PALETTE.orange },
		},
		{
			name: "Variables (other)",
			scope: "variable.other, variable.other.readwrite",
			settings: { foreground: PALETTE.foreground },
		},
		{
			name: "Object Properties",
			scope: "variable.other.property, variable.other.object.property",
			settings: { foreground: PALETTE.foreground },
		},
		{
			name: "Object Keys",
			scope: "meta.object-literal.key",
			settings: { foreground: PALETTE.blueLight },
		},

		// --- Classes & Types ---
		{
			name: "Classes",
			scope: "entity.name.class, support.class, entity.other.inherited-class",
			settings: { foreground: PALETTE.purple },
		},
		{
			name: "Types",
			scope: "entity.name.type, support.type",
			settings: { foreground: PALETTE.blueLight },
		},
		{
			name: "Interfaces",
			scope: "entity.name.type.interface",
			settings: { foreground: PALETTE.blueLight },
		},
		{
			name: "TypeScript Type Annotations",
			scope: "meta.type.annotation, entity.name.type.ts",
			settings: { foreground: PALETTE.purple },
		},
		{
			name: "Entity Name Fallback",
			scope: "entity.name",
			settings: { foreground: PALETTE.purple },
		},

		// --- Punctuation ---
		{
			name: "Punctuation",
			scope: "punctuation, punctuation.definition.block, punctuation.definition.parameters, punctuation.separator, punctuation.terminator, meta.brace",
			settings: { foreground: PALETTE.punctuation },
		},

		// --- Tags (HTML/JSX) ---
		{
			name: "Tags (HTML/JSX)",
			scope: "entity.name.tag, punctuation.definition.tag, support.class.component",
			settings: { foreground: PALETTE.green },
		},
		{
			name: "Tag Attributes",
			scope: "entity.other.attribute-name",
			settings: { foreground: PALETTE.purple },
		},

		// --- CSS ---
		{
			name: "CSS Properties",
			scope: "support.type.property-name.css",
			settings: { foreground: PALETTE.blue },
		},
		{
			name: "CSS Values",
			scope: "support.constant.property-value.css, support.constant.color",
			settings: { foreground: PALETTE.blueLight },
		},
		{
			name: "CSS Selectors",
			scope: "entity.other.attribute-name.class.css, entity.other.attribute-name.id.css",
			settings: { foreground: PALETTE.green },
		},

		// --- Regex ---
		{
			name: "Regex",
			scope: "string.regexp",
			settings: { foreground: PALETTE.blueLight },
		},
		{
			name: "Regex Source",
			scope: "source.regexp",
			settings: { foreground: PALETTE.blueLighter },
		},
		{
			name: "Regex Character Classes",
			scope: [
				"string.regexp.character-class",
				"string.regexp constant.character.escape",
				"string.regexp source.ruby.embedded",
				"string.regexp string.regexp.arbitrary-repitition",
			].join(", "),
			settings: { foreground: PALETTE.blueLighter },
		},
		{
			name: "Escape Characters",
			scope: "constant.character.escape",
			settings: { foreground: PALETTE.green },
		},

		// --- Markdown ---
		{
			name: "Markdown Headings",
			scope: "markup.heading, entity.name.section.markdown, punctuation.definition.heading.markdown",
			settings: { foreground: PALETTE.blue, fontStyle: "bold" },
		},
		{
			name: "Markdown Bold",
			scope: "markup.bold",
			settings: { foreground: PALETTE.foreground, fontStyle: "bold" },
		},
		{
			name: "Markdown Italic",
			scope: "markup.italic",
			settings: { foreground: PALETTE.foreground, fontStyle: "italic" },
		},
		{
			name: "Markup Underline",
			scope: "markup.underline",
			settings: { fontStyle: "underline" },
		},
		{
			name: "Markup Strikethrough",
			scope: "markup.strikethrough",
			settings: { fontStyle: "strikethrough" },
		},
		{
			name: "Markdown Quote",
			scope: "markup.quote",
			settings: { foreground: PALETTE.green },
		},
		{
			name: "Markdown Links",
			scope: "markup.underline.link",
			settings: { foreground: PALETTE.blue },
		},
		{
			name: "Markdown Code",
			scope: "markup.inline.raw, markup.fenced_code",
			settings: { foreground: PALETTE.blue },
		},
		{
			name: "Markdown List Punctuation",
			scope: "punctuation.definition.list.begin.markdown",
			settings: { foreground: PALETTE.orange },
		},

		// --- Data Formats ---
		{
			name: "JSON Keys",
			scope: "support.type.property-name.json",
			settings: { foreground: PALETTE.blue },
		},
		{
			name: "YAML Keys",
			scope: "entity.name.tag.yaml",
			settings: { foreground: PALETTE.blue },
		},

		// --- Meta ---
		{
			name: "Meta Module Reference",
			scope: "meta.module-reference",
			settings: { foreground: PALETTE.blueLight },
		},
		{
			name: "Meta Separator",
			scope: "meta.separator",
			settings: { foreground: PALETTE.blueLight, fontStyle: "bold" },
		},
		{
			name: "Meta Output",
			scope: "meta.output",
			settings: { foreground: PALETTE.blueLight },
		},

		// --- Diff ---
		{
			name: "Diff Deleted",
			scope: "markup.deleted, meta.diff.header.from-file, punctuation.definition.deleted",
			settings: { foreground: PALETTE.pink, background: PALETTE.diffDeletedBg },
		},
		{
			name: "Diff Inserted",
			scope: "markup.inserted, meta.diff.header.to-file, punctuation.definition.inserted",
			settings: { foreground: PALETTE.green, background: PALETTE.diffInsertedBg },
		},
		{
			name: "Diff Changed",
			scope: "markup.changed, punctuation.definition.changed",
			settings: { foreground: PALETTE.orange, background: PALETTE.diffChangedBg },
		},
		{
			name: "Diff Range",
			scope: "meta.diff.range",
			settings: { foreground: PALETTE.purple, fontStyle: "bold" },
		},
		{
			name: "Diff Header",
			scope: "meta.diff.header",
			settings: { foreground: PALETTE.blueLight },
		},

		// --- Invalid / Errors ---
		{
			name: "Invalid",
			scope: "invalid.broken, invalid.deprecated, invalid.illegal, invalid.unimplemented",
			settings: { foreground: PALETTE.pink, fontStyle: "italic" },
		},
		{
			name: "Error Message",
			scope: "message.error",
			settings: { foreground: PALETTE.pink },
		},

		// --- Links ---
		{
			name: "Links",
			scope: "constant.other.reference.link, string.other.link",
			settings: { foreground: PALETTE.blueLighter, fontStyle: "underline" },
		},
	],
};

const outPath = join(__dirname, "uchu-theme.json");
writeFileSync(outPath, JSON.stringify(theme, null, "\t") + "\n");
console.log(`Written: ${outPath}`);
