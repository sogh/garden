import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { wikiLinkPlugin } from './src/lib/wiki-link.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://garden.example.com', // change me
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
