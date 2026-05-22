import { getCollection, type CollectionEntry } from 'astro:content';
import GithubSlugger from 'github-slugger';

type AnyEntry =
  | CollectionEntry<'notes'>
  | CollectionEntry<'experiments'>
  | CollectionEntry<'digests'>
  | CollectionEntry<'media'>;

export interface Backlink {
  id: string;
  title: string;
  collection: string;
  excerpt?: string;
}

const WIKI_LINK_RE = /\[\[([^\]]+?)\]\]/g;

/**
 * Walks every content entry, extracts [[wiki-links]], and builds a reverse map
 * from target slug → entries that link to it.
 *
 * Cached at module level so we only pay the cost once per build.
 */
let cache: Map<string, Backlink[]> | null = null;

async function buildIndex(): Promise<Map<string, Backlink[]>> {
  if (cache) return cache;

  const slugger = new GithubSlugger();
  const backlinks = new Map<string, Backlink[]>();

  const all: AnyEntry[] = [
    ...(await getCollection('notes')),
    ...(await getCollection('experiments')),
    ...(await getCollection('digests')),
    ...(await getCollection('media')),
  ];

  for (const entry of all) {
    const body = entry.body ?? '';
    const matches = body.matchAll(WIKI_LINK_RE);
    const linkedSlugs = new Set<string>();

    for (const m of matches) {
      const raw = m[1].split('|')[0].trim();
      slugger.reset();
      linkedSlugs.add(slugger.slug(raw));
    }

    for (const slug of linkedSlugs) {
      const existing = backlinks.get(slug) ?? [];
      existing.push({
        id: entry.id,
        title: entry.data.title,
        collection: entry.collection,
        excerpt: extractExcerpt(body),
      });
      backlinks.set(slug, existing);
    }
  }

  cache = backlinks;
  return backlinks;
}

function extractExcerpt(body: string): string | undefined {
  // First non-empty paragraph, capped at ~140 chars
  const para = body
    .split('\n\n')
    .map(p => p.trim())
    .find(p => p.length > 0 && !p.startsWith('#'));
  if (!para) return undefined;
  const cleaned = para.replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1').replace(/[*_`]/g, '');
  return cleaned.length > 140 ? cleaned.slice(0, 140).trimEnd() + '…' : cleaned;
}

export async function getBacklinks(slug: string): Promise<Backlink[]> {
  const index = await buildIndex();
  return index.get(slug) ?? [];
}

export async function getAllTags(): Promise<Map<string, number>> {
  const tags = new Map<string, number>();
  const all: AnyEntry[] = [
    ...(await getCollection('notes')),
    ...(await getCollection('experiments')),
    ...(await getCollection('digests')),
    ...(await getCollection('media')),
  ];
  for (const entry of all) {
    for (const t of entry.data.tags) {
      tags.set(t, (tags.get(t) ?? 0) + 1);
    }
  }
  return tags;
}

export async function getRecentEntries(limit = 20): Promise<AnyEntry[]> {
  const all: AnyEntry[] = [
    ...(await getCollection('notes', e => !e.data.draft)),
    ...(await getCollection('experiments', e => !e.data.draft)),
    ...(await getCollection('digests', e => !e.data.draft)),
    ...(await getCollection('media', e => !e.data.draft)),
  ];
  return all
    .sort((a, b) => {
      const aDate = a.data.updated ?? a.data.created;
      const bDate = b.data.updated ?? b.data.created;
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, limit);
}
