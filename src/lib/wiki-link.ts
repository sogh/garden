// @ts-expect-error - remark-wiki-link doesn't ship types
import wikiLink from 'remark-wiki-link';
import GithubSlugger from 'github-slugger';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { withBase } from './site';

const slugger = new GithubSlugger();

const slugify = (name: string): string => {
  slugger.reset();
  return slugger.slug(name);
};

const NOTES_DIR = fileURLToPath(new URL('../content/notes', import.meta.url));

/**
 * Every note slug that currently exists, for remark-wiki-link's `permalinks`.
 *
 * Without this the plugin has nothing to match against, so it treats *every*
 * target as missing and marks all links broken — including the ones that
 * resolve fine. Slugs go through the same slugify() as the link text so the
 * two sides always agree.
 *
 * Read once at config load: a note added while `astro dev` is running needs a
 * restart before links to it stop showing as broken.
 */
function existingNoteSlugs(): string[] {
  try {
    return readdirSync(NOTES_DIR, { recursive: true, encoding: 'utf8' })
      .filter(f => /\.mdx?$/.test(f))
      .map(f => slugify(f.replace(/\.mdx?$/, '')));
  } catch {
    // No notes directory yet — every link is legitimately broken.
    return [];
  }
}

/**
 * Remark plugin that resolves [[wiki-links]] to /notes/{slug} URLs.
 *
 * Links to non-existent notes get a `wiki-link--broken` class so you can style
 * them differently — useful for spotting dangling references in the garden.
 */
export const wikiLinkPlugin = [
  wikiLink,
  {
    permalinks: existingNoteSlugs(),
    pageResolver: (name: string): string[] => [slugify(name)],
    hrefTemplate: (permalink: string): string => withBase(`/notes/${permalink}`),
    aliasDivider: '|',
    wikiLinkClassName: 'wiki-link',
    newClassName: 'wiki-link--broken',
  },
];
