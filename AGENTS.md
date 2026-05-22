# AGENTS.md

Context for any agent (Claude Code, the `garden post` CLI, or scheduled
digest jobs) writing into this garden. Read this first.

## Who I am

Mark — software engineer, lives on Evergreen Farm on Camano Island with
Megan and Lindsey. Side projects span music theory tooling (`fretboard-explorer`
/ Harmonic Atlas, `harmonia` Rust crate), game development in Rust/Bevy
(`dinner-party`, `spriteforge`), and creative tools (`songmap`). Plays guitar
in a band. Built this garden to capture in-progress thinking without the
overhead of a devblog.

## Voice

- Conversational. Lowercase-leaning. Sentence fragments are fine.
- First person, present tense. "I'm working on X" not "Work continues on X."
- Honest about uncertainty. "I think this is right" beats "this is right."
- Specific over abstract. "the drop-2 voicing on the 6th-diminished tool" beats
  "music theory work."
- Comfortable with `code-fenced` terms inline. Use them.
- Parenthetical asides are encouraged (when they earn their keep).

## What to NEVER do

- No marketing speak. No "exciting developments," no "I'm thrilled to share."
- No summarizing for the sake of summarizing. If there's nothing to say,
  the draft should be one sentence.
- No invented progress. If the commit messages say one thing, don't extrapolate
  to a grander narrative.
- No emoji unless I've used one in this conversation already.
- No "stay tuned" or "more to come" filler.
- No headers if the note is under ~300 words. Just write paragraphs.

## Frontmatter

Every note needs:

```yaml
---
title: "..."           # concept-oriented, not "May 22 update"
created: YYYY-MM-DD
tags: [...]            # see taxonomy below
growth: seedling       # seedling | budding | evergreen — start at seedling
source: agent          # human | agent | collab — be honest
---
```

For digests, also include `period` (e.g. `2026-W21`) and `projects`.

For experiments, also include `stack` (array of tech) and optionally `repo`.

## Tag taxonomy

Existing tags — prefer reusing these over inventing new ones. If proposing
a new tag, suggest it in the PR/diff rather than just using it.

- `music-theory` — anything theory-side, not project-specific
- `harmonic-atlas` — the named music tool project
- `barry-harris` — Barry Harris methodology specifically
- `harmonia` — the Rust crate
- `dinner-party` — the Bevy drama-engine game
- `spriteforge` — the sprite middleware
- `songmap` — the band teaching tool
- `bevy` — Bevy/Rust game-dev topics generically
- `rust` — Rust the language
- `wasm` — WASM-related
- `pkm` — personal knowledge management / note-taking meta
- `meta` — about the garden itself
- `farm` — Evergreen Farm topics
- `band` — band/playing-related (non-theory)
- `projects` — project-overview-level notes
- `digest` — agent-generated weekly summaries
- `writing` — writing process / voice
- `tools` — software tools and workflows

## Linking

- Use `[[wiki-links]]` aggressively. Every note should link to at least 1–2
  others.
- Link to concept names, not file paths. `[[evergreen-notes]]` not `[[notes/evergreen]]`.
- Before linking, check whether the target note exists. If not, either:
  - Create the target as a stub seedling note, OR
  - Note the broken link in your output so I can decide.
- Don't invent connections that aren't really there. A weak link is worse
  than no link.

## Growth states

- `seedling` — just captured, rough, possibly wrong. Most agent-written notes
  start here.
- `budding` — has been edited at least once, idea is taking shape.
- `evergreen` — durable, well-linked, I'd point someone at it. Agents almost
  never write directly to evergreen. Promotion is human work.

## Source

- `human` — I wrote it directly.
- `agent` — drafted by an agent, possibly with light editing. Visible badge.
- `collab` — substantive back-and-forth between me and the agent. Visible badge.

Be honest. If the agent drafted it and I tweaked a sentence, that's still
`agent` (or `collab` if I rewrote meaningfully).

## When in doubt

- Shorter is better.
- A seedling with one good line beats a polished essay that says nothing.
- If the draft feels like LinkedIn, throw it out and start over.
