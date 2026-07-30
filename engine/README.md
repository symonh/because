# engine/ — the vendored MindMup rendering engine

`vendor/mapjs/` is the MIT-licensed [mindmup/mapjs](https://github.com/mindmup/mapjs)
source (upstream commit `e30f8d8`, its last public state, Dec 2018) — the same
engine MindMup's argument visualization ran on. Local changes are small and
recorded in `vendor/mapjs/LOCAL-PATCHES.diff`:

- `set-theme-class-list.js` — let the `sticky_note` style name through to the
  DOM class list (upstream only passed `level_*` / `attr_*`).
- `update-connector.js` — honor a theme-level connector line style (dotted
  note links) and a theme-level default label text (the high-impact theme's
  "because…" / "but…").
- `dom-map-controller.js` — allow top-edge decorations (the number badge
  straddles the top-right corner, like MindMup).
- `dom-map-widget.js` / `hammer-draggable.js` — require the esbuild shims for
  jquery plugins (hotkeys / hammer).
- `core/theme/connector.js` — a connector style can set `squareCorners: true`
  to render a bracket's overline with right-angle turns instead of the
  rounded default; the argument-mapping theme's `opposing-group` style uses
  it, so an objection's bracket is square while a reason's stays rounded
  (a non-color cue, not part of the verbatim MindMup theme extraction).
  `noCorners: true` is the third shape: a bare bar with no turns at all, at
  the same y and over the same full span as the square one. The
  `neutral-group` style uses it, so the three bracket kinds differ in shape
  as well as color — rounded = reason, square = objection, flat = neutral.
  A connector style can also set `arrow` (drawn via `theme/arrow-path.js`,
  extracted from `theme/link.js`): `'to'` puts the head at the child end
  pointing down into the group (High-impact downward), `'from'` puts it at
  the parent end pointing up into the claim (High-impact upward).
  `line-types.js` ends the curve where the head begins (splitting the
  quadratic at a head length from the endpoint) and reports that point as
  `arrowStems`, so the stroke never runs through the head and the head's
  angle follows the curve. `arrow-path.js` exports `axisLength` for it.
- `core/layout/calculate-layout.js` + `core/layout/top-down/calculate-top-down-layout.js`
  — a theme can set `layout.spacing.nestedGroupLabel`, which drops a bracket
  nested inside another bracket (a reason or objection aimed at the
  inference) by that many pixels when it carries a connector label, taking
  its premises with it. Upstream lays it flush under its parent's bracket,
  which leaves the label it allows on that connector nowhere to sit. Only
  that subtree moves, so the claims beside it stay on their level; a nested
  bracket with no label, and any theme not setting the key, lays out exactly
  as before.
- `update-connector-text.js` — a label position can carry
  `centerOnLine: true` so the connector runs through the middle of its label
  (masked behind the text) instead of resting on top of the line; only the
  high-impact themes set it.
- `calc-label-center-point.js` — `aboveEnd` labels sit on the actual curve
  at label height (binary search) instead of a node-centre interpolation;
  new `belowStart` position hangs the label a fixed offset below the
  parent's base, and new `midSpan` puts it halfway between the parent's
  base and the child's top — the middle of the connector, which is where
  both high-impact themes place "Because" / "But" / "Therefore". (The
  stock `ratio` position measures along the whole path, and a group
  connector's path carries the bracket, so half its length lands on the
  bracket.)
- `update-node-content.js` — a node whose theme resolves to a transparent
  background no longer gets that written as an inline style, which
  shadowed the stylesheet. Compound theme styles reach a node only through
  the generated CSS (`nodeStyles` resolves flat names), so this is what
  lets `attr_group_supporting.level_1` paint — the MindMup theme's own
  styling for a bracket detached from the tree.

## Build

```
./build.sh        # npm install on first run, then esbuild both bundles
```

Outputs `../app/bundle.js` (globals bundle for the app shell) and
`../engine-demo/bundle.js` (self-contained demo). Both are committed so the
app runs from a plain static server with no build step.

## Theme

`theme-argmap.js` holds the authentic MindMup argument-mapping theme —
extracted verbatim from the embedded `theme` object of a `.mup` file saved by
the real product, not reconstructed. The app has its own ES-module copy in
`app/js/themes.js`; keep the two in sync if values change.
