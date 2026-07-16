# ArgumentBase — status & honest handoff (2026-07-16, overnight)

## The short version

I went down the wrong road first, you caught it, and I've corrected course. This
file records exactly where things stand so no time is lost in the morning.

**Wrong road:** I built a *custom* SVG renderer from scratch (`app.js` +
`index.html`). It got the simple cases looking plausible but could not reproduce
the actual argument-visualization grammar on real maps — most importantly it
could not keep **co-premises** tight together under one bracket once one of them
had a sub-argument, so joint support stopped reading as joint support. You were
right to reject it. A hand-rolled renderer was never going to match MindMup.

**Right road (validated tonight):** the MIT-licensed **`mindmup/mapjs`** engine
*is* MindMup's real argument-mapping renderer. Feeding a `.mup` file into it with
the argument-mapping theme produces MindMup-fidelity output because it is the same
code and the same layout engine. The engine's contour layout keeps co-premises
adjacent and hangs sub-arguments below — exactly the behaviour the custom renderer
couldn't fake.

Proof (rendered through the real engine tonight): `docs/engine-render-proof-death.png`.
It matches your reference image for the death map: one tight green bracket over the
two co-premises, single vertical stem, boxed nodes, the implicit premise (2.2)
blue-dotted, numbering 1.1 / 2.1 / 2.2.

## What is proven

- `mapjs` (MIT, v4.1.0, Dec 2018) builds today with esbuild (two tiny shims) and
  renders argument maps from real `.mup` files.
- The **theme** is JSON and fully controls the look. I updated it
  (`engine/theme-argmap.js`) to match current MindMup:
  - default node → white box, 1.4px `#9aa0a4` border, rounded, subtle shadow,
    15px left-aligned text (was: borderless text on an overline).
  - added `attr_implicit_claim` → bright-blue (`#29abe2`) dotted border.
  - muted the bracket connectors from pure `#00FF00`/`#FF0000` to `#3a9b52` / `#cc4636`.
  - restored the group nodes to transparent overline so the green/red brackets draw
    correctly over the boxes.
- **Numbering** works via `mapModel.setLabelGenerator` — see `argLabelGenerator`
  in `engine/start.js` (level.index BFS, skips group + sticky nodes).
- The engine already exposes every editing operation we need (its demo toolbar has
  supporting group / opposing group / add / edit / delete / undo / redo, and the
  model API `addGroupSubidea`, `insertIntermediateGroup`, etc.).

## Known cosmetic gaps (small, on the engine path)

- Number badge currently renders as the engine's default **grey rectangle**; MindMup
  shows a **blue circle**. This is the label/decoration style — a CSS/decoration
  tweak, not a structural problem.
- Root node shows the blue-dotted "selected" border on load (it's auto-selected).
  Correct editor behaviour; for a clean/published view, deselect on load.
- Font weight/colour can be nudged closer to the reference.

## The path to a finished product (in order)

1. **Vendor mapjs into this repo** as the engine (npm `@mindmup/mapjs` + the two
   esbuild shims in `engine/`), with a build step that emits `app.bundle.js`.
2. Replace the custom renderer: `index.html` hosts the mapjs `DomMapController` +
   our `engine/theme-argmap.js` + `argLabelGenerator`.
3. Build the **app shell** around it: clean toolbar (New / Open .mup / Save .mup /
   Export PNG / + Reason / + Objection / + Co-premise / Implicit / Delete / Undo /
   Redo / numbering toggle) wired to the existing mapModel operations.
4. Polish the theme to near-pixel: blue-circle badges, fonts, spacing, the
   high-impact "because…/but…" connector labels (theme `argMappingHighImpact`).
5. **Google Drive integration** (the actual point): Drive API v3 `drive.file`
   scope, open/save `.mup` in the user's Drive, Picker for "open". No server.
6. Deploy (static): a public bucket or Firebase Hosting on `driveshare-446802`
   (that project name looks purpose-made; `sc@` can create buckets there — verified
   tonight). `argumentbase.com` is owned for a custom domain later.

## Files

- `engine/theme-argmap.js` — the MindMup-matched argument-mapping theme (USE THIS).
- `engine/start.js` — engine wiring + `argLabelGenerator` numbering.
- `docs/engine-render-proof-death.png` — proof the engine path is correct.
- `app.js`, `index.html` — **deprecated** custom renderer. Kept for history; do not
  build on it. Its `.mup` parsing notes and the format spec are still useful.
- `samples/` — synthetic fixtures mirroring your reference images (death,
  vegetarian, genetic-independent vs genetic-copremises, lee-house).
- `test/` — Puppeteer render + e2e harness (useful for the engine path too).

## Deploy note

Nothing was deployed. Given your instruction not to publish anything uninterpretable,
that was the right call — the only thing that renders correctly is the engine path,
and it isn't wrapped in a shippable shell yet.
