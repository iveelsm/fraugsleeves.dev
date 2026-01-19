// @ts-check
import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";
import sitemap from "@astrojs/sitemap";
import { remarkReadingTime } from "./src/remark-reading-time";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// eslint-disable-next-line
const site = process.env.SITE_URL || "https://fraugsleeves.dev";

// https://astro.build/config
export default defineConfig({
	site,
	integrations: [pagefind(), sitemap()],
	build: {
		format: "file",
	},
	markdown: {
		remarkPlugins: [remarkReadingTime],
		rehypePlugins: [
			rehypeSlug,
			[
				rehypeAutolinkHeadings,
				{
					behavior: "prepend",
					properties: {
						className: ["heading-anchor"],
						ariaLabel: "Link to this section",
					},
					content: {
						type: "element",
						tagName: "span",
						properties: { className: ["anchor-icon"] },
						children: [
							{
								type: "element",
								tagName: "svg",
								properties: {
									xmlns: "http://www.w3.org/2000/svg",
									width: "20",
									height: "20",
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "2",
									strokeLinecap: "round",
									strokeLinejoin: "round",
								},
								children: [
									{
										type: "element",
										tagName: "path",
										properties: {
											d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
										},
										children: [],
									},
									{
										type: "element",
										tagName: "path",
										properties: {
											d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
										},
										children: [],
									},
								],
							},
						],
					},
				},
			],
		],
	},
	experimental: {
		svgo: true,
	},
});
