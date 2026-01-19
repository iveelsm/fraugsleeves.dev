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
						children: [{ type: "text", value: "#" }],
					},
				},
			],
		],
	},
	experimental: {
		svgo: true,
	},
});
