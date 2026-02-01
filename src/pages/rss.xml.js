import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "../constants";
import { formatDate } from "../components/formatDate";

export async function GET(context) {
  const blog = await getCollection('blog');
  return rss({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    site: context.site,
	trailingSlash: false,
    stylesheet: '/rss.xsl',
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: formatDate(post.data.pubDate),
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
  });
}
