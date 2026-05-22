import rss from '@astrojs/rss';
import { getRecentEntries } from '../lib/backlinks';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const recent = await getRecentEntries(50);

  const linkFor = (collection: string, id: string) => {
    if (collection === 'notes') return `/notes/${id}`;
    if (collection === 'experiments') return `/experiments/${id.replace(/\/index$/, '')}`;
    if (collection === 'digests') return `/digests/${id}`;
    return '/';
  };

  return rss({
    title: 'garden',
    description: 'raw updates, ideas, and tinkering',
    site: context.site ?? 'https://example.com',
    items: recent.map(entry => ({
      title: entry.data.title,
      pubDate: entry.data.updated ?? entry.data.created,
      link: linkFor(entry.collection, entry.id),
      categories: entry.data.tags,
    })),
  });
}
