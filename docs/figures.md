# Argument-map figures on the landing page

The maps on `site/index.html` are not pictures of maps. They are real argument
maps, drawn in the editor's own grammar from the same kind of data the editor
saves — the hero and the three legend cards alike — so the page shows the reader
exactly what they are about to get. The hero also hands it over: it offers its
`.mup` for download and a link that opens it in Because.

The component came from **PhilMaps** (`symonh/PhilMaps`, `lib/argmap/` +
`src/assets/{js,css}/argmap.*`), where it was written against this app's theme
in the first place — its comments cite `app/js/themes.js`. This is the same
author's code, brought back to the app it was modelled on. PhilMaps carried
CC BY-NC 4.0 when the port was made; on 2026-07-30 Simon relicensed that repo MIT
too, so both copies are now under the same terms as this one.

## Files

```
figures/maps/home-aging.json    the hero
figures/maps/legend-*.json      the three legend cards
figures/build.mjs         renders the figures into the page; writes the .mup
figures/lib/render.js     (mapJson, opts) -> HTML; owns the numbering
figures/lib/describe.js   (mapJson) -> the prose text alternative
figures/lib/mup.js        (mapJson) -> MindMup formatVersion 3, + a validator
figures/lib/smartquotes.js  straight quotes -> curly, for display text only
site/css/argmap.css       the frame and the whole visual grammar
site/js/argmap.js         hydration: layout, connectors, keyboard
site/maps/*.mup           generated, committed, served for download
docs/og-card.html         the social card's source — the hero's map again
test/og-shot.js           renders that to site/og.png
```

`figures/` is build-time only and never deployed. `site/` is what `deploy.sh`
rsyncs to the site root, so `site/js/argmap.js` is the only JavaScript a reader
downloads for the figures — it has no imports.

## Three kinds

A **figure** (`kind` omitted) is the full thing: a framed canvas with a caption
bar offering the `.mup` and the link into the editor, plus the editor's title bar
above it when the entry says `chrome: true`. It is interactive — one tab stop,
arrow-key navigation — and carries a prose text alternative. The hero is one.

An **illustration** (`kind: 'inline'`) is a map used as a picture: no frame, no
caption, no download, rendered inert and `aria-hidden`, drawn a step smaller. The
three legend cards under "See the shape of an argument" are these. They are
aria-hidden because each card's own heading and sentence already say what its map
shows, so exposing the map too would only read the same thing twice; and inert
because a legend is not something to navigate.

A **card** (`kind: 'card'`) is the framed canvas with no caption bar, for
`docs/og-card.html` — the source of `site/og.png`, the 1200×630 social card. It
points at the hero's own map, so the image every shared link previews cannot
drift from the page it previews. Regenerate the PNG with `cd test && node
og-shot.js` (it needs the same port-8871 server the suites do, because the card
loads `site/js/argmap.js` as a module and `file://` will not). The shot runs with
reduced motion, so the entrance animation never half-draws the map, and it
refuses to write anything if the map is clipped, scrolling, mid-fade, or
unhydrated.

## Adding or changing a figure

1. Write `figures/maps/<id>.json` (schema below).
2. Add an entry to `FIGURES` in `figures/build.mjs` — its `id`, the `page` it
   goes on, and either `caption` (+ `chrome: true` for the title bar) or
   `kind: 'inline'`.
3. Put the markers where it belongs in the page:
   `<!-- argmap:<id> -->` … `<!-- /argmap:<id> -->`.
4. `node figures/build.mjs`, then commit the generated `site/index.html` and any
   `site/maps/*.mup` along with the JSON.
5. If you changed the hero, also `cd test && node og-shot.js` and commit
   `site/og.png` — the social card draws the same map.

Keep an illustration's claims short and of similar length. A card is only ~295px
wide, so two co-premises there have to wrap; they look balanced when both claims
are long enough to wrap (past about 18 characters — under that, `sizeClaims`
keeps a claim on one line so "My conclusion." can never break) and short enough
to wrap to two lines.

`claimMaxCh` is also the wrap cap the **no-JS** fallback uses verbatim, with no
fit ladder to widen it, so keep it wide enough for the map's longest word.
`.am-abs .am-claim { min-width: min-content }` guarantees this once the map has
hydrated — a box is never narrower than its longest word — but that rule is
deliberately scoped to the hydrated layout: in the flow fallback the claim is a
flex item, and WebKit sizes its cell from the claim's *unclamped* max-content
width the moment a `min-width` keyword is present, which pushes co-premises apart
and stretches the bracket over the gap. `site-e2e.js` checks every word in every
claim renders in one piece, in both states and both engines.

Never hand-edit between the markers. `node figures/build.mjs --check` fails if
the committed output has drifted; `deploy.sh` runs it, and so does
`test/site-e2e.js`.

Why a build step for a site that otherwise has none: a figure has to be right
with JavaScript switched off, and it must not jump when the script does arrive,
so the markup has to be *in* the HTML. Rendering it here and committing the
result keeps `deploy.sh` doing nothing but rsync, while the source of truth
stays the map JSON rather than a wall of hand-written divs.

## Map JSON

```jsonc
{
  "id": "home-aging",                  // must match the file name
  "title": "eradicate-aging.mup",      // shown in the title bar when chrome:true
  "root": {
    "text": "We have a moral duty to eradicate aging.",
    "groups": [
      {
        "type": "supporting",          // supporting | opposing | neutral
        "strength": "normal",          // strong (5px) | weak (1.5px) | normal (3px)
        "claims": [
          { "text": "Aging is a great evil." },
          { "text": "We have a moral duty to eradicate great evils.",
            "implicit": true,          // dashed border
            "groups": [ /* claims carry their own groups, recursively */ ] }
        ],
        "inferenceObjections": [       // objects to the bracket, not to a claim
          { "claims": [ { "text": "…" } ] }
        ]
      }
    ]
  },
  "options": {
    "numbered": true,                  // the blue badges; default true
    "claimMaxCh": 26                   // starting wrap width; the fit ladder
  }                                    // may tighten it
}
```

Numbering is computed, never stored: the root is 1.1, and every claim at depth
N gets N.1, N.2, … counted left to right across the whole map — the same numbers
the editor shows. Inference-objection claims number beside the bracket's own
claims (2.3 next to 2.1/2.2), which is what the authentic MindMup figures do.

The three group kinds are the three the editor draws (`GROUP_KINDS` in
`figures/lib/render.js`, matching `app/js/numbering.js`). `neutral` is the one
thing this copy has that PhilMaps does not: Because grew the uninterpreted
connector after PhilMaps was built.

## What the drawing has to get right

Colour is never the only cue (`docs/accessibility.md`, exception 1). Each
bracket kind has its own shape: a reason's corners are **rounded**, an
objection's are **square**, and the neutral connector's bracket is a **bare flat
bar** with no corners at all — the same three shapes `connector.js`'s
`squareCorners` / `noCorners` flags produce in the app. An implicit claim is
dashed. Claims are numbered.

Geometry, ported from PhilMaps' layout spec and its two amendments:

- **Claims inside a group sit adjacent** — one fixed gap — however wide their
  subtrees are, and the bracket hugs exactly that row. Subtrees hang *below*;
  parent→child horizontal offsets are absorbed by the S-curve connectors, which
  is what the curves are for.
- **Vertical level is argumentative level.** Claims at the same depth sit at the
  same height, always. When a level is too wide, the permitted responses in
  order are: tighten the claim wrap (floor 15ch) → widen the figure past its
  container (only for figures marked `data-breakout`; the hero sits in a grid
  cell and must not) → zoom the whole map down (floor ~0.75, real layout at
  reduced metrics) → horizontal scroll inside the canvas, at rest centred on the
  root claim. The page itself never scrolls sideways.
- **The conclusion is the centre**: it centres over its groups' bracket bars,
  not over the whole descendant envelope, so its connector is plumb — and a
  near-plumb drop is drawn as a straight line rather than a vestigial S.
- **Colliding families share the displacement.** A lone child block stays dead
  centred under its parent claim; blocks that must spread to clear each other
  split the shift between them, so both curve symmetrically.

Two states, one geometry. Without JavaScript the map is a nested flex render
whose bracket is assembled from overlapping segments and whose connector is a
straight CSS stem — structurally correct, never clipped. Hydration flips it to
`.am-abs` (wrappers become `display:contents`, every box gets measured
coordinates, the bracket becomes one element) and draws the SVG curves. The two
land on the same bracket line, so the canvas height moves by about a pixel; the
suite holds it to four.

## Accessibility

Each figure is one tab stop. The map is a `role="tree"` of `role="treeitem"`
claims carrying `aria-level`, `aria-selected` and `aria-activedescendant` —
deliberately the same semantics `app/js/a11y-canvas.js` layers onto the editor's
canvas, so a screen reader reads a figure the way it reads the app. Arrow keys
move the selection (Down into the first child group, Up to the parent,
Left/Right between siblings), Escape clears it. `describe.js` writes the hidden
prose alternative that `aria-describedby` points at; it names every claim by its
number, marks implicit ones, and says of a neutral connector only that it links
two things — the prose must not smuggle in a reading the map refuses to make.
The entrance animation fades by level and is opacity-only, because the layout
engine measures those boxes and a transform would move what it measures.

## Left in PhilMaps

The lesson layer did not come over, because this site has no lessons: keyed
**demos** (a before-state figure that transitions to an after-state when the
reader presses the real editor key, with FLIP animation and a live region), the
**strength popover** on a connector, and the **quiz cards**. The data model and
the renderer here are the same ones those were built on — `render.js` still
takes the `inert` option the quiz mini-maps used, and still has `embedData` for
putting the source JSON back in the page — so any of it can be brought across
from `src/assets/js/argmap.js` in that repo without redesign.

## Tests

`cd test && node site-e2e.js` (needs `python3 -m http.server 8871` at the repo
root, like the other suites). In both Chrome and real WebKit it checks the
committed render is current, the no-JS figure, the hydrated geometry (adjacent
co-premises, hugging bracket, plumb straight connector, centred conclusion), the
keyboard model, all three bracket shapes plus the implicit dash and the
inference-objection bar, the legend cards (right bracket per card, inert and
aria-hidden, one panel height across the row), the narrow-viewport fit, reduced
motion, and that the generated `.mup` really opens in the app through `?src=`. It
also runs axe-core over the page for the WCAG 2.2 AA gate — with reduced motion
on, so nothing is measured mid-fade.
