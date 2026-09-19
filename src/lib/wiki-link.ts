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

const CONTENT_DIR = fileURLToPath(new URL('../content', import.meta.url));

/**
 * Collections a [[wiki-link]] can point at, in precedence order for the rare
 * case where two collections hold the same slug. `media` is absent on purpose:
 * it has no route, so there'd be nothing to link to.
 */
const LINKABLE = ['notes', 'experiments', 'digests'] as const;

/**
 * Every linkable slug mapped to its URL path.
 *
 * Two jobs in one pass: the keys are remark-wiki-link's `permalinks` (without
 * them it marks every link broken), and the values let `hrefTemplate` send a
 * link to the collection that actually holds it, instead of assuming /notes/.
 *
 * Experiments are `<name>/index.mdx`, so the slug is the directory — matching
 * both the route and what someone would type in a link.
 *
 * Read once at config load: a new entry needs an `astro dev` restart before
 * links to it resolve.
 */
function linkTargets(): Map<string, string> {
  const targets = new Map<string, string>();

  for (const collection of LINKABLE) {
    let files: string[];
    try {
      files = readdirSync(`${CONTENT_DIR}/${collection}`, {
        recursive: true,
        encoding: 'utf8',
      });
    } catch {
      continue; // collection directory doesn't exist yet
    }

    for (const file of files) {
      if (!/\.mdx?$/.test(file)) continue;
      const bare = file.replace(/\.mdx?$/, '');
      // experiments/<name>/index.mdx -> <name>; notes/<name>.md -> <name>
      const name = collection === 'experiments' ? bare.replace(/\/index$/, '') : bare;
      if (!name || name.includes('/index')) continue;
      const slug = slugify(name);
      if (!targets.has(slug)) targets.set(slug, `/${collection}/${name}`);
    }
  }

  return targets;
}

const TARGETS = linkTargets();

/**
 * Remark plugin that resolves [[wiki-links]] across notes, experiments and
 * digests.
 *
 * Links to entries that don't exist get a `wiki-link--broken` class so you can
 * style them differently — useful for spotting dangling references.
 */
export const wikiLinkPlugin = [
  wikiLink,
  {
    permalinks: [...TARGETS.keys()],
    pageResolver: (name: string): string[] => [slugify(name)],
    // Unknown slugs still render (as broken); point them at /notes/, where a
    // stub would most likely be created.
    hrefTemplate: (permalink: string): string =>
      withBase(TARGETS.get(permalink) ?? `/notes/${permalink}`),
    aliasDivider: '|',
    wikiLinkClassName: 'wiki-link',
    newClassName: 'wiki-link--broken',
  },
];
