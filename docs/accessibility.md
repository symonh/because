# Accessibility

Because targets WCAG 2.2 Level AA. This note records the measures in the
app chrome, the palette used for contrast, and the places where full
conformance is bounded by the project's rendering-fidelity rule. The
regression gate is `test/a11y-e2e.js`.

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
- **Live save status.** `#save-status` is a `role="status"` live region,
  so screen readers announce save-state changes.
- **Focus visibility.** `:focus-visible` outlines are drawn on chrome
  buttons/links/inputs, the map container, and map nodes (the last
  overrides the vendor stylesheet's `outline:none`). These are ephemeral
  focus UI, never printed or serialized.

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
   reason's bracket from an objection's — the objection (opposing-group)
   bracket now renders with square corners where a reason's stays
   rounded (`app/js/themes.js`'s `squareCorners` flag, read by the
   `appendOverLine` LOCAL PATCH in
   `engine/vendor/mapjs/src/core/theme/connector.js`; see
   `engine/README.md`). This one shape change is intentional and applies
   only to this app's own named themes — a map with a fully embedded
   theme (historical MindMup exports) still renders exactly as saved.
   Focus and selection are shown with outlines and ARIA state, not color
   alone.
2. **Connector curves are thin click targets.** The connecting lines are
   narrow and can be hard to click precisely. Every connector action has a
   keyboard-reachable equivalent in the Argument Visualization menu — Edit
   connector label, Stronger connector, Weaker connector — so the mouse
   target is never the only way to reach a command.
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
`group` child of the tree, and focusing the map lands real focus on a
named treeitem.
