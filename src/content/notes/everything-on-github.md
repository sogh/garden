---
title: "Everything on GitHub, roughly"
created: 2026-10-05
tags: [projects]
growth: seedling
source: agent
---

A one-line-each map of what's in `github.com/sogh`, so I stop having to
remember. Only repos with real work in them (a dozen-plus commits, give or
take); the one-commit placeholders and forks are left out. Grouped by what
they're for, newest-ish first.

## Music

- **`fretboard-explorer`** — the browser music theory toolbox: fretboard,
  circle of fifths, progressions, scales, a practice sequencer, plus piano and
  trumpet pages. No build step. See [[harmonic-atlas]].
- **`fretboard-explorer-ios`** — the SwiftUI port. Most of the recent work is
  the circle-of-fifths "maps", picking one voicing per chord instead of
  stacking them.
- **`harmonia`** — instrument-agnostic theory primitives in Rust: pitch
  classes, intervals, chords, keys, Roman numerals. The layer under the
  fretboard, not tied to one.
- **`song-map`** — songs as graphs: sections are nodes, transitions are edges.
  Scrapes tabs for a song list and turns them into maps for the band.
- **`dawesome`** — a C++ DAW for songwriters, not producers. Sections instead
  of a timeline, roles (voice, rhythm, bass) instead of numbered tracks.
- **`resonance`** — "SpaceChem but music." A Godot/C# prototype where bots on a
  grid trigger notes; so far it plays a perfect fifth and proves the clock.

## Simulations

- **`nature-sim`** — the big one (330-odd commits). A PNW meadow in Bevy with
  a real sun and moon, weather, seasons, and a 320×200 pixel renderer that does
  time of day by palette cycling. See [[time-of-day-by-cycling-the-palette]].
- **`promenade`** — aristocratic social drama over generations in Rust:
  lineage, status, scandal, blackmail. Drama is meant to fall out of agents
  chasing status.
- **`faction-sim`** — the medieval version of the same itch: hundreds of
  agents, competing factions, output meant for a director to pick the good
  bits.
- **`village-sim`** — utility-AI villagers in Bevy ECS with needs, memory and
  fog of war.
- **`dinner-party-sim`** — a TypeScript "terrarium for personalities":
  arrange guest lists and seating, then watch.
- **`narrative-engine`** — procedural text for games without a neural net:
  stochastic grammars plus Markov phrasing, driven by simulation events.

## Games and game tools

- **`lost-your-marbles`** — marble rolling through generated dungeons, with a
  camera that follows the solution path. See
  [[a-marble-game-that-generates-its-own-levels]].
- **`level-generator`** — the generator behind it: nethack rooms, marble
  channels with slopes, and wave function collapse mazes.
- **`rust-marble-party`** — marble physics with a hand-rolled SDF solver
  instead of a physics crate. A steel ball in a spiral tube.
- **`SpriteForge`** — seed-based procedural sprites, keeping the blueprint
  separate from the pixels. Has an egui editor.
- **`rust-tactics-engine`** and **`tactics-web`** — two goes at a Final Fantasy
  Tactics–style game, one in Bevy and one in React/PixiJS with multiplayer.
- **`voxel-artist`** — procedural voxel shapes, CPU-raycast to PNG.

## Everything else

- **`glance-png-server`** — PNG panels for the pixel display in the kitchen:
  weather, wind, tides, calendar, scores. See [[ten-slots-is-not-ten-panels]]
  and [[the-tide-is-only-highs-and-lows]].
- **`garden`** — this.
- **`soghblog`** — the old blog this replaced, with a few side apps bolted on.
  See [[why-a-garden-not-a-blog]].
- **`furple`** — Python game experiments from 2020–21.
- **`CarlinIndex`** — a 2013 JavaScript project. I don't remember much about
  it.
