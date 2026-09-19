/**
 * Single source of truth for where the site is mounted.
 *
 * GitHub Pages serves a project repo from `/<repo>`, so every internal link
 * needs that prefix. Astro rewrites its own asset URLs from `base`, but not
 * hand-written hrefs or anything in public/ — hence `withBase`.
 *
 * Moving to a custom domain (or a <user>.github.io repo) means setting
 * BASE_PATH to '' and nothing else changes.
 */
export const BASE_PATH = '/garden';

export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  return `${BASE_PATH}${path}` || '/';
}

/**
 * A content entry's slug, as it appears in a URL and in a [[wiki-link]].
 *
 * Experiments live at `<name>/index.mdx`, so their collection id carries an
 * `/index` the route strips. Everything that matches an entry to a link — the
 * wiki-link map, the backlink index — has to strip it the same way.
 */
export function entrySlug(id: string): string {
  return id.replace(/\/index$/, '');
}

/** Site-root-relative path to an entry (no base; pass through withBase). */
export function entryPath(collection: string, id: string): string {
  return `/${collection}/${entrySlug(id)}`;
}
