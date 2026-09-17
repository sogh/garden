// @ts-expect-error - remark-wiki-link doesn't ship types
import wikiLink from 'remark-wiki-link';
import GithubSlugger from 'github-slugger';
import { withBase } from './site';

const slugger = new GithubSlugger();

/**
 * Remark plugin that resolves [[wiki-links]] to /notes/{slug} URLs.
 *
 * Links to non-existent notes get a `broken-link` class so you can style
 * them differently — useful for spotting dangling references in the garden.
 */
export const wikiLinkPlugin = [
  wikiLink,
  {
    pageResolver: (name: string): string[] => {
      slugger.reset();
      return [slugger.slug(name)];
    },
    hrefTemplate: (permalink: string): string => withBase(`/notes/${permalink}`),
    aliasDivider: '|',
    wikiLinkClassName: 'wiki-link',
    newClassName: 'wiki-link--broken',
  },
];
