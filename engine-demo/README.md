# engine-demo — the real MindMup engine, rendering correctly

This is the MIT `mindmup/mapjs` engine (MindMup's actual argument-mapping
renderer) built with our current-MindMup theme (`../engine/theme-argmap.js`) and
the numbering label generator (`../engine/start.js`). It is the **correct**
rendering path — it reproduces the argument-visualization grammar faithfully
because it is the same engine MindMup runs.

## Run it

```
python3 -m http.server 8000 --directory .
# open http://localhost:8000/
```

- It opens with a demo map baked in.
- **Drag any `.mup` file onto the window** to render it. Your real course/student
  maps open unchanged.

## What's correct here (vs the deprecated custom renderer in the repo root)

- Co-premises: one tight bracket over adjacent boxes, single stem.
- Independent reasons: separate brackets, fanning connectors.
- Objections: red brackets. Implicit premises: blue dotted border.
- Numbering: 1.1 / 2.1 / 2.2 … Sub-arguments hang below without pushing
  co-premises apart (contour layout).

## Caveats (this is the raw engine demo, not the finished product)

- The toolbar is the engine's developer toolbar (ugly, but every button works:
  supporting group / opposing group / add / edit / delete / undo / redo).
- Number badges are the engine's grey rectangles; MindMup's blue circles are a
  decoration-style tweak still to do.
- The initial map is compiled into `bundle.js`; a real Open/Save (and Google
  Drive) belongs in the app shell (see `../STATUS.md`).
- `bundle.js` is committed for convenience; it should be built from vendored
  `@mindmup/mapjs` in CI for the real product.
