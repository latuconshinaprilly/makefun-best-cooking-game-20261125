# Gelato Giardino — Garden Gelato Stand

A cooking game set at a little gelato stand in a flower garden, drawn in a
pistachio, cream and rose palette. Guests stroll up to the order board with
a named sundae in mind — Giardino Classic, Rose Garden, Nutty Vine and
friends — and it is your job to build it exactly right before their
patience, and your gelato, run out.

## How to play

1. Read the ticket on the **order board**: cone or cup, the scoop stack
   (numbered bottom-first), the topping, and the patience bar draining
   underneath.
2. Click a **cone or cup** (or press Q / W / E) to set it on the assembly
   plate.
3. Click a **gelato tub** in the case (keys 1–6) to dig a scoop. Scooping
   takes a moment, and the stack starts **melting** as soon as the first
   scoop lands — watch the melt bar on the plate.
4. Add the **topping** (keys 7–0) once the stack is complete.
5. **Serve** with the SERVE button or Enter/Space. A perfect, barely melted
   sundae earns a bonus. Wrong dish or a melted tower goes in the bin
   (Backspace), and three guests walking away ends the shift.
6. Survive the 150-second shift, keep the coins climbing, and don't let the
   garden rush — bigger orders, thinner patience — catch you scooping slowly.

## Layout

- `game/` — the playable game (plain files, canvas, no external assets):
  menu data in `src/recipes.js`, the order board in `src/orders.js`, the
  scooping and melt stations in `src/stations.js`, all drawing in
  `src/render.js`, controls in `src/input.js`, and the game loop in
  `src/main.js`.
- `screenshots/` — renders of the stand: the cover, a mid-rush moment, and
  a sundae ready to serve.
- `main.ts` — assembles the submission and writes `dossier.json`.

[![make.fun bounty](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
![rank](https://make.fun/badge/best-cooking-game-20261125-0137/latuconshinaprilly/makefun-best-cooking-game-20261125/rank.svg)
![reward](https://make.fun/badge/best-cooking-game-20261125-0137/latuconshinaprilly/makefun-best-cooking-game-20261125/reward.svg)

Bounty: https://make.fun/bounty/best-cooking-game-20261125-0137
