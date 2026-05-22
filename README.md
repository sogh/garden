# garden

A digital garden for raw updates, ideas, and embedded experiments.
Astro + MDX + wiki-links + a Claude agent for drafts and weekly digests.

Inspired by [notes.andymatuschak.org](https://notes.andymatuschak.org) but
tuned for mixing prose, media, and interactive code (Rust/WASM, JS web apps).

## What's in here

```
garden/
├── src/
│   ├── content/
│   │   ├── notes/         markdown notes (the bulk of the garden)
│   │   ├── experiments/   interactive embeds, one folder per experiment
│   │   ├── digests/       weekly summaries (mostly agent-drafted)
│   │   └── media/         image/video posts
│   ├── components/        Backlinks, GrowthIndicator, SourceBadge, WasmEmbed
│   ├── layouts/           BaseLayout, NoteLayout
│   ├── pages/             routing
│   ├── lib/               wiki-link plugin, backlink computation
│   ├── styles/            global.css (the whole visual system)
│   └── content.config.ts  Zod schemas for every collection
├── scripts/
│   ├── garden-post.ts     CLI: capture a thought → drafted note
│   └── garden-digest.ts   CLI: scan project repos → weekly digest
├── .github/workflows/
│   └── digest.yml         Monday morning digest job (opens PR)
├── AGENTS.md              voice, tag taxonomy, frontmatter rules
└── astro.config.mjs
```

## First run (local)

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static output to ./dist
npm run preview      # serve the built site
```

You should see the seed notes, the example experiment, and the example digest
on the homepage feed.

## Writing a note by hand

Drop a file in `src/content/notes/<slug>.md`:

```markdown
---
title: "Drop-2 voicings are a fretboard puzzle"
created: 2026-05-22
tags: [music-theory, harmonic-atlas]
growth: seedling
source: human
---

The thing I keep getting wrong is...

Related: [[the-harmonic-atlas-project]].
```

Save, refresh, it's live. The `[[wiki-link]]` resolves to `/notes/the-harmonic-atlas-project`,
and the target note's page automatically shows this note as a backlink.

## Writing a note with the agent

```bash
export ANTHROPIC_API_KEY=sk-ant-...   # or put it in .env
npm run post
```

It prompts you for a rough thought. You type a few lines, hit enter twice.
The CLI reads `AGENTS.md` plus a sample of existing notes for context,
sends it to Claude, and writes a draft to `src/content/notes/<slug>.md`.

You review the diff, edit if needed, commit (or `git restore` if it missed
the voice).

One-liner mode:

```bash
npm run post -- "quick idea: the drop-2 overlay needs to separate pitch from position"
```

The note will be tagged `source: agent`, which gets a visible badge in the UI.
Be honest about provenance.

## Embedding an experiment

Create `src/content/experiments/<name>/index.mdx`:

```mdx
---
title: "..."
created: 2026-05-22
tags: [...]
stack: [rust, wasm, tone-js]
repo: https://github.com/sogh/...
---

import WasmEmbed from '../../../components/WasmEmbed.astro';

Some prose.

<WasmEmbed src="/experiments/<name>/index.html" height={520} />

More prose.
```

Drop the compiled WASM/JS into `public/experiments/<name>/`. Astro serves
everything under `public/` as static assets, so `wasm-pack build --target web --out-dir public/experiments/<name>` is the typical pipeline.

For React/JS-only experiments, you can also import the component directly in
the MDX and skip the iframe. Iframe is the safer default when the experiment
has its own runtime or styling that shouldn't bleed.

## The weekly digest

The `garden-digest` CLI scans recent commits across your project repos and
drafts a weekly "what changed" note.

Local run:

```bash
# Edit garden.config.example.json to garden.config.json and update paths
cp garden.config.example.json garden.config.json
$EDITOR garden.config.json

npm run digest                          # last 7 days
npm run digest -- --since "14 days ago" # custom window
```

Scheduled run: `.github/workflows/digest.yml` runs every Monday at 08:00 UTC.
It checks out your garden + project repos, runs the digest, and opens a PR.
You review and merge (or close if it's filler).

To enable:

1. Add `ANTHROPIC_API_KEY` as a repo secret.
2. Edit the `Checkout <project>` steps in the workflow to match your repos.
3. Update the `GARDEN_REPOS` env var to match the checkout paths.

## Deploying to Cloudflare Pages

The fastest path to production:

1. Push this repo to GitHub.
2. Cloudflare Pages → Create project → connect the repo.
3. Build command: `npm run build`. Output: `dist`. Framework: Astro (auto-detected).
4. (Optional) Add a custom domain.

That's it. Static output, free tier, fast.

Alternatives: Vercel, Netlify, GitHub Pages, anywhere that serves static files.

## What's intentionally not here

- **Comments / webmentions.** Public but not interactive. Add later if you
  want.
- **Search.** Add Pagefind when the garden has enough notes to need it.
- **Dark mode.** The warm cream palette is the design — commit to it.
- **A graph view.** Backlinks alone get you 80% of the value.
- **Stacking panes.** Single column. Add later if you actually want it.

## Tweaking the look

It's all in `src/styles/global.css`. The CSS custom properties at the top
control the whole palette. Change `--accent` and the lavender accent shifts
everywhere. The body type lives at the top of the file (`--serif`).

## Updating the agent's voice

`AGENTS.md` is the single source of truth. Both `garden-post` and `garden-digest`
read it on every invocation. Tweak the voice, tag taxonomy, or rules there —
no code changes needed.

## License

Whatever you want. It's your garden.
