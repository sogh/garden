import rss from '@astrojs/rss';
import { getRecentEntries } from '../lib/backlinks';
import type { APIContext } from 'astro';
import { withBase } from '../lib/site';

export async function GET(context: APIContext) {
  const recent = await getRecentEntries(50);

  const linkFor = (collection: string, id: string) => {
    if (collection === 'notes') return withBase(`/notes/${id}`);
    if (collection === 'experiments') return withBase(`/experiments/${id.replace(/\/index$/, '')}`);
    if (collection === 'digests') return withBase(`/digests/${id}`);
    return withBase('/');
  };

  return rss({
    title: 'garden',
    description: 'raw updates, ideas, and tinkering',
    site: new URL(withBase('/'), context.site ?? 'https://example.com'),
    items: recent.map(entry => ({
      title: entry.data.title,
      pubDate: entry.data.updated ?? entry.data.created,
      link: linkFor(entry.collection, entry.id),
      categories: entry.data.tags,
    })),
  });
}
