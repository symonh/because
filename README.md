# Because

A standalone editor and renderer for MindMup argument visualizations (`.mup`
files). MindMup discontinued free argument-visualization access through Google
Drive in June 2026;
Because runs the same MIT-licensed rendering engine
([mindmup/mapjs](https://github.com/mindmup/mapjs)) with the product's own
argument-mapping theme, so existing course maps open unchanged and render the
way they did in MindMup. (Briefly named ArgumentBase — legacy infrastructure
IDs such as the Firebase site `argumentbase` keep the old name.)

![the app](docs/app-ui.png)

## Run it

Hosted: **https://app.philmaps.com** (also at argumentbase.web.app, the
underlying Firebase site; deployed from this repo with
`./deploy.sh`). Locally, no build step is needed — the engine bundles are
committed:

```
python3 -m http.server 8871      # from the repo root
open http://127.0.0.1:8871/app/
```

- Drag any `.mup` file onto the window to open it, or use File → Open.
- File → Save writes a standard `.mup` (JSON) that MindMup-family tools read.
- Google Drive open/save is built in (`drive.file` scope, Picker-based);
  enabling it on a deployment takes one OAuth client — see
  [docs/drive-setup.md](docs/drive-setup.md).
- Microsoft OneDrive open/save is built in too (Graph `Files.ReadWrite`,
  PKCE popup auth, in-app picker); enabling it takes one Entra app
  registration — see [docs/onedrive-setup.md](docs/onedrive-setup.md).
- Work is autosaved to the browser's localStorage as crash recovery; the
  status text tracks whether the map is saved to its file.

## Keyboard (the philmaps.com set)

| Key | Action |
|---|---|
| Enter | add reason under selected claim |
| Tab | add co-premise to selected claim |
| Alt+O | add objection |
| T (or Alt+T) | toggle reason/objection (on a bracket) or implicit/explicit (on a claim) |
| Alt+N | add sticky note |
| arrows | navigate; F2/Space edit; Delete remove; ⌘Z/⌘⇧Z undo/redo |
| Z / Shift+Z | zoom |

## The argument-visualization grammar

- Co-premises (claims that jointly make one reason) share **one bracket** with
  a single stem; independent reasons get **separate brackets** with fanning
  stems.
- Green brackets support; **red brackets are objections**.
- **Dashed borders** mark implicit claims; sticky notes are yellow handwriting
  notes; claim numbering (1.1, 2.1 …) is a view toggle. Click a number to put
  your own text there instead (up to 10 characters, stored per claim as
  `attr.claimLabel`); clearing it returns the claim to the computed number.

![co-premises vs independent reasons](docs/copremises-vs-independent.png)

## Fidelity

The theme is not a lookalike: it is the argument-mapping theme JSON extracted
from the embedded `theme` object of a `.mup` file saved by the MindMup product
(`app/js/themes.js`, `engine/theme-argmap.js`), plus the fonts MindMup used
(NotoSans for claims, Architects Daughter for stickies). Per-map embedded
themes, author-set node widths, connector-width overrides, links and
attachments in real `.mup` files are honored by the engine as-is. Known gaps:
CSS dashed borders draw slightly shorter dashes than MindMup's renderer, and
the `argMappingHighImpact` theme is reconstructed (base theme + "because…" /
"but…" connector labels) rather than extracted.

## Repo layout

```
app/           the editor (static ES modules; app/bundle.js is the engine)
engine/        vendored mapjs source + build script (see engine/README.md)
engine-demo/   raw engine playground (drag a .mup onto it; ?src=&labels=0)
samples/       synthetic .mup fixtures safe for a public repo
samples-local/ real course maps — gitignored, never commit
test/          seven e2e suites (Chrome + real WebKit) and render-map.js (headless renders)
docs/          rendered proofs
```

Tests: `cd test && npm ci`, serve the repo root (`python3 -m http.server
8871`), then run all seven suites — `node app-e2e.js`, `node
click-select-e2e.js`, `node drive-e2e.js`, `node onedrive-e2e.js`,
`node features-e2e.js` (Chrome via puppeteer-core), `node webkit-e2e.js`
(Playwright WebKit, the Safari-engine check) and `node a11y-e2e.js`
(WCAG 2.2 AA gate: axe-core scans plus the keyboard model, also WebKit —
see docs/accessibility.md). All seven must pass before deploying.
