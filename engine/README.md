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
  A connector style can also set `arrow` (drawn via `theme/arrow-path.js`,
  extracted from `theme/link.js`): `'to'` puts the head at the child end
  pointing down into the group (High-impact downward), `'from'` puts it at
  the parent end pointing up into the claim (High-impact upward).
  `line-types.js` ends the curve where the head begins (splitting the
  quadratic at a head length from the endpoint) and reports that point as
  `arrowStems`, so the stroke never runs through the head and the head's
  angle follows the curve. `arrow-path.js` exports `axisLength` for it.
- `update-connector-text.js` — a label position can carry
  `centerOnLine: true` so the connector runs through the middle of its label
  (masked behind the text) instead of resting on top of the line; only the
  high-impact themes set it.
- `calc-label-center-point.js` — `aboveEnd` labels sit on the actual curve
  at label height (binary search) instead of a node-centre interpolation;
  new `belowStart` position hangs the label a fixed offset below the
  parent's base (the upward theme's "Therefore" labels).

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
