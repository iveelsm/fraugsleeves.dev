// @ts-check
import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";
import { remarkReadingTime } from "./src/remark-reading-time";

// https://astro.build/config
export default defineConfig({
	integrations: [pagefind()],
	build: {
		format: "file",
	},
	markdown: {
		remarkPlugins: [remarkReadingTime],
	},
});
