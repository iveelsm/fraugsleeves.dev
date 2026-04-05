import type { PreloadConfig } from "astro-font-loader";

export const IVEELSM_FONTS_FILTER = (filename: string) =>
	filename.toLowerCase().includes("berkeleymonovariable") ||
	filename.toLowerCase().includes("ebgaramond");

export const IVEELSM_FONTS_PRELOAD: PreloadConfig[] = [
	{
		filter: (filename: string) =>
			[
				"ebgaramond-semibold.woff2",
				"berkeleymonovariable-regular.woff2",
				"berkeleymonovariable-italic.woff2",
			].some((name) => filename.toLowerCase().includes(name)),
	},
	{
		filter: (filename: string) =>
			["ebgaramond-bold.woff2"].some((name) =>
				filename.toLowerCase().includes(name),
			),
		media: "(min-width: 641px)",
	},
];
