import type { FontConfig } from "astro-font-loader";

const FONT_CONFIGURATION = [
	{
		family: "Berkeley Mono",
		source: { type: "package" as const, package: "@iveelsm/fonts" },
		variants: [
			{
				name: "Berkeley Mono v2 Variable",
				weight: [100, 900],
				styles: ["normal", "oblique"],
			},
		],
	},
	{
		family: "EB Garamond",
		source: { type: "package" as const, package: "@iveelsm/fonts" },
		variants: [
			{ name: "EB Garamond", weight: 600, styles: ["normal"] },
			{ name: "EB Garamond", weight: 700, styles: ["normal"] },
		],
	},
] as FontConfig[];

export { FONT_CONFIGURATION };
