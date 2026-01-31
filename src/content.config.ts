import { defineCollection, z } from "astro:content";

import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		shortDescription: z.string(),
		pubDate: z.coerce.date(),
		image: z
			.object({
				url: z.string(),
				alt: z.string(),
			})
			.optional(),
		author: z.string().optional(),
		editors: z.array(z.string()).optional(),
		tags: z.array(z.string()).optional(),
	}),
});

const wayfinders = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/wayfinders" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		shortDescription: z.string(),
		pubDate: z.coerce.date(),
		image: z
			.object({
				url: z.string(),
				alt: z.string(),
			})
			.optional(),
		author: z.string().optional(),
		editors: z.array(z.string()).optional(),
		tags: z.array(z.string()).optional(),
	}),
});

export const collections = { blog, wayfinders };
