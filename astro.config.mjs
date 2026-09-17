import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { wikiLinkPlugin } from './src/lib/wiki-link.ts';
import { BASE_PATH } from './src/lib/site.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://sogh.github.io',
  base: BASE_PATH,
  integrations: [
    mdx({
      remarkPlugins: [wikiLinkPlugin],
    }),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [wikiLinkPlugin],
    shikiConfig: {
      theme: 'rose-pine-dawn',
      wrap: true,
    },
  },
});
