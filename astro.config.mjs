// @ts-check
import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";
import sitemap from "@astrojs/sitemap";
import { remarkReadingTime } from "./src/remark-reading-time";

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
	},
	experimental: {
		svgo: true,
	},
});
