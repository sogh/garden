import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const baseFrontmatter = z.object({
  title: z.string(),
  created: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  // seedling = rough, recent, half-formed; budding = developing; evergreen = mature
  growth: z.enum(['seedling', 'budding', 'evergreen']).default('seedling'),
  // honest about provenance — agent-written notes get a visible marker
  source: z.enum(['human', 'agent', 'collab']).default('human'),
  draft: z.boolean().default(false),
  // optional: hand-curated list of related notes (overrides backlink heuristic)
  related: z.array(z.string()).default([]),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: baseFrontmatter.extend({
    kind: z.literal('note').default('note'),
  }),
});

const experiments = defineCollection({
  loader: glob({ pattern: '**/index.{md,mdx}', base: './src/content/experiments' }),
  schema: baseFrontmatter.extend({
    kind: z.literal('experiment').default('experiment'),
    stack: z.array(z.string()).default([]), // e.g. ["rust", "wasm", "tone.js"]
    repo: z.string().url().optional(),
    demo: z.string().optional(), // path or URL to live demo
  }),
});

const digests = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/digests' }),
  schema: baseFrontmatter.extend({
    kind: z.literal('digest').default('digest'),
    period: z.string().optional(), // e.g. "2026-W21" or "may-2026"
    projects: z.array(z.string()).default([]),
  }),
});

const media = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/media' }),
  schema: baseFrontmatter.extend({
    kind: z.enum(['image', 'video']).default('image'),
    src: z.string(), // path or URL
    caption: z.string().optional(),
  }),
});

export const collections = { notes, experiments, digests, media };
