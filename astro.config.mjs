// @ts-check
import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";
import { remarkReadingTime } from "./src/remark-reading-time";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: 'https://fraugsleeves.dev',
    integrations: [pagefind(), sitemap()],
    build: {
        format: "file",
    },
    markdown: {
        remarkPlugins: [remarkReadingTime],
    },
});
