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
