# Accessibility

Because targets WCAG 2.2 Level AA. This note records the measures in the
app chrome, the palette used for contrast, and the places where full
conformance is bounded by the project's rendering-fidelity rule. The
regression gate is `test/a11y-e2e.js`.

The landing page has its own gate, `test/site-e2e.js`, because its
argument-map figures draw the same grammar the app does and so inherit
exception 1 below — including the shape distinction between the three
bracket kinds. The figures carry the canvas tree semantics described
under "Canvas tree semantics" (one tab stop, `role="tree"` /
`role="treeitem"`, `aria-level`, `aria-selected`,
`aria-activedescendant`, arrow-key navigation) plus a prose text
alternative for each figure; see docs/figures.md.

## App-chrome measures

- **Scoped keyboard model.** Single-key shortcuts (WCAG 2.1.4) are active
  only in map scope: `app/js/shortcuts.js` returns early when focus is in
  an input, a textarea, a `contenteditable`, or anywhere in the chrome, so
  a bare letter typed in the menus or a text field is never intercepted as
  a command. Focus on the map container or the body counts as map scope.
- **Menubar semantics.** The top menu is a WAI-ARIA menubar
  (`<nav role="menubar">`); its titles carry `role="menuitem"` with
  `aria-haspopup`, and dropdown entries are `menuitem`,
  `menuitemcheckbox`, or `menuitemradio` as appropriate (`app/js/menus.js`).
  Menu titles and items are real `<button>` elements; `app/css/app.css`
  resets native button chrome so they render as before.
- **Toolbar semantics.** Each button strip (`#toolbar` as the left rail or
  the classic bar, `#float-tools`, `#float-zoom`, `#mobilebar`) is a
  WAI-ARIA toolbar: one Tab stop, with the arrow keys, Home and End moving
  between the buttons and the tab stop following the last one used
  (`applyToolbarRoving` in `app/js/toolbar.js`). The explicit `tabindex`
  that pattern puts on the roving button is load-bearing beyond the
  pattern itself: WebKit leaves a `<button>` out of the sequential focus
  order unless it carries one (on macOS, Safari's "Press Tab to highlight
  each item on a webpage" is off by default), so while these buttons had
  no `tabindex` at all the strips were skipped entirely and the rail could
  not be reached by keyboard in Safari — a WCAG 2.1.1 failure that the
  suite now covers. The two chrome buttons outside a strip (`#theme-toggle`
  while it sits in the top bar, and the floating layout's `#float-menu`)
  carry `tabindex="0"` for the same reason. Dialog buttons need no such
  treatment: `initModal` moves focus itself rather than relying on the
  browser's tab order.
- **Modal dialogs.** Every overlay (menu info panels, the intro, the
  unsaved-changes guard) goes through `initModal` in `app/js/a11y.js`,
  which sets `role="dialog"` + `aria-modal`, labels the dialog from its
  heading, traps Tab, handles Escape (capture phase, so it never also
  closes what is behind it), and restores focus to the previously focused
  element on close.
- **Canvas tree semantics.** `app/js/a11y-canvas.js` layers WAI-ARIA tree
  semantics onto the DOM the engine draws: the container is
  `role="tree"` and the single Tab stop, the positioning stage is its
  `role="group"` child (an intact required-children chain), nodes are
  `role="treeitem"` reached with the arrow keys, and `aria-level` /
  `aria-expanded` / `aria-selected` track structure and state. Real DOM
  focus rides on the selected node (roving focus): the container
  delegates focus to the selection the moment it receives it, and the
  arrow keys move focus with the selection, so screen readers announce
  each claim from native focus events. An earlier version kept focus on
  the container and pointed `aria-activedescendant` at the selection;
  NVDA + Chrome failed to follow that indirection and announced the map
  as "unknown invisible", so activedescendant is no longer used anywhere
  on the canvas. The SVG connector/bracket layer is `aria-hidden="true"`
  because the relationships it draws are already in the tree. None of
  this touches map data — attributes go on DOM the engine already
  rendered, so a `.mup` still serializes byte-identical.
- **Connector labels are announced.** The words an author writes on a
  connecting line are drawn in that aria-hidden SVG layer, so until
  2026-08-03 a reader walking the map with the arrow keys never heard
  them — an NVDA user reported hearing a label while typing it and never
  again. The label belongs to the connector *arriving* at a node (the
  `.mup` keeps it on the child, as `attr.parentConnector.label`), so it is
  announced there, in whichever ARIA property does not displace an
  existing name: a bracket's accessible name is written by this app, so
  the label joins it ("Supporting reasons (group), labelled Because"),
  while a claim's name is the claim's own text, so a claim's label rides
  in `aria-describedby` pointing at a clipped `.sr-only` span outside the
  container (`role="tree"` admits only `treeitem` children, and a span
  inside a node would also be measured by the layout). Clearing a label
  removes both. The theme's *own* default label — "Because" / "But" /
  "Therefore" in the high-impact themes — is deliberately left out: it
  restates what the bracket's name already says, and only an author's own
  words are content the tree does not otherwise carry.
- **Leaving the canvas (WCAG 2.1.2).** Inside the map Tab is the
  co-premise key, so Tab cannot also be the way out; that left the
  browser's own F6 as the only exit, which is not something a reader can
  be expected to find (reported alongside the connector-label gap).
  **Escape** now leaves the map: focus moves to the app menu — the
  menubar's roving title, or the single menu button the floating and
  mobile layouts hang the same spec behind (`focusChrome` in
  `app/js/a11y.js`) — and Tab walks on through the chrome from there. The
  success criterion permits an exit that is not Tab as long as the user is
  told of it, so it is stated in two places: the keyboard reference, and
  the canvas's own `aria-describedby` ("Arrow keys move through the
  argument. Press Escape to leave the map."). Escape only means this when
  nothing else is open that it already belongs to — a dropped menu, a
  popover, a modal (the `CLOSEABLE` list in `app/js/shortcuts.js`) —
  otherwise the exit would swallow the key that closes them.
- **Live save status.** `#save-status` is a `role="status"` live region,
  so screen readers announce save-state changes.
- **Focus visibility.** `:focus-visible` outlines (`#16749f`, 5.21:1) are
  drawn on chrome buttons/links/inputs and the map container. A map node
  instead shows selection and keyboard focus through the theme's own
  "activated" border — 3px, dotted for an explicit claim, dashed for an
  implicit one, dotted green/red for a reason/objection bracket — so one
  indicator also carries the claim's implicit/explicit state and the
  bracket's kind. (An earlier build layered a solid ring on top; it read as
  two concentric outlines and, being a single flat colour, hid the
  dotted/dashed state cue.) The border's colour is the authentic theme
  `#22aae0`, covered by the fidelity exception below; the cues that are not
  colour are the 1px→3px width jump, the dotted/dashed style, and
  `aria-selected`. The border is part of the rendered map, so it is the one
  focus-affordance that does print.

## Contrast palette

Chrome text and UI colors were adjusted to meet AA (4.5:1 for text, 3:1
for UI-component boundaries). Ratios are computed against the actual
background each color sits on.

| Element | Color | Background | Ratio |
|---|---|---|---|
| `.menu-title` hover / open | `#16749f` | `#eef6fb` | 4.76 |
| `.menu-item` hover text | `#16749f` | `#eef6fb` | 4.76 |
| `#save-status` | `#6e6e6e` | `#fff` | 5.10 |
| `#save-status` (dark) | `#a2a9b0` | `#24272b` | 6.31 |
| `.panel a` | `#16749f` | `#fff` | 5.21 |
| Save button text | `#fff` | `#16749f` | 5.21 |
| `.intro-start` text | `#fff` | `#16749f` | 5.21 |
| `.intro-start` hover | `#fff` | `#11577a` | 7.87 |
| `.cp-tile` text | `#16749f` | `#fff` | 5.21 |
| `.cp-tile` hover text | `#fff` | `#16749f` | 5.21 |
| `.connector-label-editor` border | `#1987b5` | `#fff` | 4.06 (UI, needs 3:1) |
| Focus outline | `#16749f` | `#fff` | 5.21 |
| Focus outline (dark) | `#6cc4ee` | dark chrome | passes |

The site pages (`site/index.html`, `site/privacy.html`, `site/terms.html`)
use the same darkened link/accent color `#16749f` and muted grey `#6e6e6e`
for the same reasons.

## Documented exceptions

1. **Map-canvas content rendering follows the MindMup theme verbatim,
   with one deliberate exception for shape.** The colors of map content —
   for example the `#22aae0` claim-number badges and the green/red group
   colors — come from the authentic theme JSON embedded in `.mup` files,
   which is the project's fidelity anchor and must not be changed for
   contrast. Color is not the only cue: the high-impact theme labels
   groups with bracket text ("Because" / "But"), implicit claims carry
   dashed borders, claims are numbered, dark mode offers an alternative
   luminance, and — since color alone previously distinguished a
   reason's bracket from an objection's — **each bracket kind has its own
   shape**: a reason's stays rounded, an objection's (opposing-group)
   renders with square corners, and the neutral connector's
   (neutral-group) is a bare flat bar with no corners at all
   (`app/js/themes.js`'s `squareCorners` / `noCorners` flags, read by the
   `appendOverLine` LOCAL PATCH in
   `engine/vendor/mapjs/src/core/theme/connector.js`; see
   `engine/README.md`). So the three kinds are still told apart with
   color perception removed entirely. These shape changes are
   intentional and apply only to this app's own named themes — a map
   with a fully embedded theme (historical MindMup exports) still
   renders exactly as saved. The neutral connector's `#0070C0` is the
   one group color that is a local addition rather than an extraction
   (MindMup's grammar had no neutral bracket); it was chosen to clear
   3:1 non-text contrast and in fact holds 5.1:1 on white paper and
   5.3:1 on the dark canvas, so unlike the authentic green and red it
   needed no separate treatment for the chrome icons. Authoring the
   neutral connector is off by default behind **View > Allow neutral
   connectors** (a `localStorage` preference, like dark mode and the
   layout choice), which adds and removes one toolbar button, one Insert
   item, one keyboard-reference row and the Alt+Q binding together — so
   the reference never lists a key the app is ignoring. Rendering is
   never gated: a map that uses the connector draws it either way.
   Focus and selection are shown with border style and width (dotted vs
   dashed, 1px vs 3px) and ARIA state, not color alone.
2. **Connector curves are thin click targets.** The connecting lines are
   narrow and can be hard to click precisely. Every connector action has a
   keyboard-reachable equivalent in the Argument menu — Edit connector
   label, Stronger connector, Weaker connector — so the mouse target is
   never the only way to reach a command, and labelling also has a key of
   its own, **L**, which opens the editor on the connector above the
   selection.
3. **Toolbar hints use native tooltips.** Toolbar buttons expose their
   hint through the native `title` attribute. This relies on the browser's
   own tooltip behavior rather than a custom AA-styled tooltip.

## Testing

`test/a11y-e2e.js` is the regression gate for the measures above; run it
alongside the other e2e suites before deploying. Most of the suite runs
in WebKit (the Safari rule); a final section launches the installed
Chrome and asserts against the accessibility tree Chromium computes
(via CDP), not just the DOM attributes we author — the two can diverge,
and the computed tree is what Windows screen readers such as NVDA
consume. That section exists because every DOM-level check passed while
an NVDA user heard "unknown invisible": it asserts the map is exactly
one tree named "Argument map", every node is a named treeitem under a
`group` child of the tree, focusing the map lands real focus on a
named treeitem, and — since a label reaching a computed *name* is no
guarantee that another reaches a computed *description* — that both
kinds of connector label and the canvas's Escape hint survive into the
computed tree as well.
