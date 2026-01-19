import { getCollection } from "astro:content";

export async function getUniqueTags(): Promise<string[]> {
	const blogs = await getCollection("blog");
	const allTags = blogs.flatMap((post) => post.data.tags || []);
	return [...new Set(allTags)].sort();
}


export async function getUniqueOccurences(): Promise<Record<string, number>> {
	const blogs = await getCollection("blog");
	const allTags = blogs.flatMap((post) => post.data.tags || []);

	const tagCounts = allTags.reduce(
		(acc, tag) => {
			acc[tag] = (acc[tag] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	return tagCounts;
}
