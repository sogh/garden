---
title: "Time of day by cycling the palette"
created: 2026-09-18
tags: [projects, rust, bevy]
growth: seedling
source: agent
---

`nature-sim` is one simulation with two renderers bolted over it. Underneath:
a fast day/night cycle on a real solar arc, a real lunar model, PNW weather,
seasons, plant lifecycles, butterflies. On top, either a 320×200 256-colour
pixel view in the style of the VGA point-and-click adventures, or a
first-person walk through swaying grass.

The pixel view does time of day by *cycling the palette* — the same trick those
games used, because they had to. That's the detail I like most. It isn't
nostalgia for its own sake; palette cycling means the sun moving costs you a
colour table write instead of a re-render, and the constraint that forced it in
1993 still pays out now.

Nothing in it is an art asset. No sprite sheets, no textures, not one PNG —
it's all generated procedurally in code and tuned from `config/meadow.yaml`.
Five places she can walk between (meadow, cave, town, ship's bridge, bakery),
and the five binaries are the same program differing only in which place is on
screen when it opens.

The part that surprised me reading back through it: stop giving her input and
after a few seconds she carries on by herself.

It's been quiet since the 14th. Sixty-one commits between the 8th and the 14th,
one of those days had twenty-nine, and then nothing — the last few were a
bakery, a coin, marshmallows at the fire. It stopped mid-feature rather than at
a finish line, which is worth knowing before picking it back up.

Related: [[ten-slots-is-not-ten-panels]].
