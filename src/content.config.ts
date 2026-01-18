import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/pages/blog" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		author: z.string().optional(),
		editors: z.array(z.string()).optional(),
		tags: z.array(z.string()).optional(),
	}),
});

const wayfinders = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/pages/wayfinders" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		author: z.string().optional(),
		editors: z.array(z.string()).optional(),
		tags: z.array(z.string()).optional(),
	}),
});

export const collections = { blog, wayfinders };
