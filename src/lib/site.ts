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
