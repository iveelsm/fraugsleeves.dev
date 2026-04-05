/* eslint-disable */
import fs from "node:fs";
import path from "node:path";

import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import pagefind from "astro-pagefind";
import sitemap from "@astrojs/sitemap";
import { remarkReadingTime } from "./src/remark-reading-time";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeNumericReferences from "./src/rehype-numeric-references";
import { fontsIntegration } from "astro-font-loader";
import { IVEELSM_FONTS_FILTER } from "./src/constants";

const site = process.env.SITE_URL || "https://fraugsleeves.dev";

// https://astro.build/config
export default defineConfig({
	site,
	integrations: [
		react(),
		fontsIntegration({
			packages: ["@iveelsm/fonts"],
			filter: IVEELSM_FONTS_FILTER,
		}),
		pagefind(),
		sitemap({
			filter: (page) =>
				!page.endsWith("/wayfinders") &&
				!page.endsWith("/blog") &&
				!page.endsWith("/tags") &&
				!page.includes("/404") &&
				!page.includes("/503"),
		}),
	],
	build: {
		format: "file",
	},
	vite: {
		plugins: [
			{
				name: "serve-pagefind",
				configureServer(server) {
					const MIME_TYPES = {
						".js": "application/javascript",
						".wasm": "application/wasm",
						".css": "text/css",
						".json": "application/json",
					};

					const pagefindDir = path.resolve(
						process.cwd(),
						"dist",
						"pagefind",
					);
					server.middlewares.use((req, res, next) => {
						if (!req.url?.startsWith("/pagefind/")) {
							return next();
						}

						let pathname;
						try {
							pathname = new URL(req.url, "http://localhost")
								.pathname;
						} catch {
							return next();
						}

						const relativePath = pathname.slice(
							"/pagefind/".length,
						);
						const filePath = path.resolve(
							pagefindDir,
							relativePath,
						);
						if (
							!filePath.startsWith(pagefindDir + path.sep) &&
							filePath !== pagefindDir
						) {
							return next();
						}

						fs.readFile(filePath, (err, data) => {
							if (err) {
								return next();
							}

							const ext = path.extname(filePath);
							res.setHeader(
								"Content-Type",
								MIME_TYPES[ext] || "application/octet-stream",
							);
							res.end(data);
						});
					});
				},
			},
		],
		build: {
			rollupOptions: {
				external: ["/pagefind/pagefind.js"],
			},
		},
	},
	markdown: {
		remarkPlugins: [remarkReadingTime],
		shikiConfig: {
			theme: (await import("./src/themes/uchu-theme.json")).default,
		},
		rehypePlugins: [
			rehypeSlug,
			rehypeNumericReferences,
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
