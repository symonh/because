# Accessibility

Because targets WCAG 2.2 Level AA. This note records the measures in the
app chrome, the palette used for contrast, and the places where full
conformance is bounded by the project's rendering-fidelity rule. The
regression gate is `test/a11y-e2e.js`.

The landing page has its own gate, `test/site-e2e.js`, because its
argument-map figures draw the same grammar the app does, including the
shape distinction between the three bracket kinds (see "Map colours and
the high-contrast view" below). The figures carry the canvas tree semantics described
under "Canvas tree semantics" (one tab stop, `role="tree"` /
`role="treeitem"`, `aria-level`, `aria-selected`,
`aria-activedescendant`, arrow-key navigation, and the tree named
"Argument map") plus a prose text
alternative for each figure; see docs/figures.md.

## App-chrome measures

- **Scoped keyboard model.** Single-key shortcuts (WCAG 2.1.4) are active
  only in map scope: `app/js/shortcuts.js` returns early when focus is in
  an input, a textarea, a `contenteditable`, or anywhere in the chrome, so
  a bare letter typed in the menus or a text field is never intercepted as
  a command. Single-character keys (t, d, l, m, z, ?, Shift+T) act only
  while focus is inside the map container; with nothing focused (the
  body) only Enter and the modifier combinations still reach the map, so
  stray typing after a load or a Safari toolbar click edits nothing.
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
- **Reading order and depth.** The engine appends node elements to the
  stage in creation order, and assistive technology infers each
  treeitem's parent from its `aria-level` and the items before it. So
  after every layout pass `a11y-canvas.js` sets each item's `aria-level`
  to its depth in the argument (a bracket one level below its claim, the
  bracket's premises one below that) and moves the elements into argument
  order: depth first, siblings in numbering order. Elements are moved
  with `moveBefore` where the browser has it; the element holding focus
  is never the one moved, and nothing is moved while a claim is being
  edited, since a blur would commit the edit.
- **Claim states are described.** Implicit claims, claims marked false or
  true, and sticky notes say so in the claim's `aria-describedby`
  ("Implicit claim. Marked false"), ahead of any connector label. The
  evaluation marks' emoji carry empty CSS alternative text, so the name
  is the claim's own words.
- **Connector labels are announced.** The words an author writes on a
  connecting line are drawn in that aria-hidden SVG layer, so until
  2026-08-03 a reader walking the map with the arrow keys never heard
  them — an NVDA user reported hearing a label while typing it and never
  again. The label belongs to the connector *arriving* at a node (the
  `.mup` keeps it on the child, as `attr.parentConnector.label`), so it is
  announced there, in whichever ARIA property does not displace an
  existing name: a bracket's accessible name is written by this app, so
  the label joins it ("Supporting reasons (group), labeled Because"),
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
- **Nothing needs a drag (WCAG 2.1.1, 2.5.7).** **Edit > Move…** (M,
  `app/js/move-mode.js`) picks the selection up; a claim or bracket chosen
  with the arrow keys and Enter, or clicked, receives it, and a click on
  blank canvas places it there standing free. It ends in the calls a drag
  ends in (`dropNode`, `positionNodeAt`), so the map data is the same.
  Reordering has Move left / Move right (⌘← / ⌘→), the resize handle has
  Wider claim / Narrower claim (40px steps), a free-standing claim moves
  20px per ⌘⇧ + arrow, and **Select bracket** reaches a bracket from any
  of its premises without the 16px strip (the 2.5.8 equivalent-control
  route).
- **Focus is never hidden (WCAG 2.4.7, 2.4.11).** Entering a loaded map
  restores the selection's activated border, which `engine.js`'s
  `deselectAll` removes for a clean first view. Chrome floating over the
  canvas (the floating cards, the mobile bar, the Move banner) becomes a
  visibility and stage margin for the engine (`setChromeMargin`), so a
  claim that receives focus is scrolled clear of it.
- **Named editors and toggles.** While a claim is being edited, its title
  span is a multi-line `role="textbox"` named "Claim text" (a LOCAL PATCH
  in `engine/vendor/mapjs/src/browser/edit-node.js`); the attributes come
  off again when editing ends. The style popover's B, I and U buttons are
  named Bold, Italic and Underline and carry `aria-pressed`: `true` when
  the whole claim has the format, `mixed` when part of it does, by the
  same test `toggleFormat` uses to decide what a press does.
- **Live save status.** `#save-status` is a `role="status"` live region,
  so screen readers announce save-state changes. The OneDrive picker's
  loading, empty-folder and error line is a status region too, and moving
  between folders puts focus on the new listing's first entry.
- **Text spacing (WCAG 1.4.12).** Claim sizes are measured at layout and
  cached, so a spacing stylesheet or inline style that arrives later
  (the WCAG bookmarklet, a reading extension) would leave claims
  overlapping. `a11y-canvas.js` watches the head and the root and body
  `style` attributes for styles this app did not write, clears the
  engine's size cache and lays the map out again.
- **Errors are reported.** A local save that fails, and a dropped file
  that is not a `.mup`, each raise an alert naming the file; a failed save
  leaves the map in place and marked unsaved.
- **Focus visibility.** `:focus-visible` outlines (`#16749f`, 5.21:1) are
  drawn on chrome buttons/links/inputs and the map container. A map node
  instead shows selection and keyboard focus through the theme's own
  "activated" border — 3px, dotted for an explicit claim, dashed for an
  implicit one, dotted green/red for a reason/objection bracket — so one
  indicator also carries the claim's implicit/explicit state and the
  bracket's kind. (An earlier build layered a solid ring on top; it read as
  two concentric outlines and, being a single flat colour, hid the
  dotted/dashed state cue.) The border's colour is the authentic theme
  `#22aae0`, or `#0b6aa0` in the high-contrast view below; the cues that are not
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
take their colors from `site/css/site.css`, which follows the system
light/dark preference. Light is warm paper (`#f7f4ed`, cards `#fdfbf7`)
around the editor's own light accent; dark is the editor's dark mode.
`test/site-e2e.js` runs axe over all three pages in both schemes.

| Element | Light | Ratio | Dark | Ratio |
|---|---|---|---|---|
| Body text on page | `#3b3731` on `#f7f4ed` | 10.76 | `#d7dbe0` on `#17191c` | 12.66 |
| Muted text on page | `#696257` on `#f7f4ed` | 5.49 | `#9aa1a8` on `#17191c` | 6.74 |
| Muted text on card | `#696257` on `#fdfbf7` | 5.83 | `#9aa1a8` on `#212429` | 5.96 |
| Footer copyright | `#6f675c` on `#f2eee6` | 4.81 | `#7d848b` on `#141518` | 4.82 |
| Links, eyebrows, focus outline on page | `#16749f` on `#f7f4ed` | 4.74 | `#5cc8f2` on `#17191c` | 9.23 |
| Links on card | `#16749f` on `#fdfbf7` | 5.04 | `#5cc8f2` on `#212429` | 8.15 |
| Button text | `#fff` on `#147aa6` | 4.81 | same | 4.81 |

The figures on the landing page draw the map in the editor's light theme
or its dark-mode mapping to match, except that the badges and the claim
focus ring use the high-contrast `#0b6aa0` (the dark ring keeps
`#22aae0`), since the page has no switch to offer that view.

## Map colours and the high-contrast view

The map is drawn in the authentic MindMup theme colours by default, which
is the project's fidelity anchor. Several of those colours fall below the
WCAG thresholds on white paper, measured from computed styles:

| Element | Authentic | Ratio | High contrast | Ratio |
|---|---|---|---|---|
| Claim-number badge (white text) | `#22aae0` at 0.8 opacity | 2.19 | `#0b6aa0` | 5.86 |
| Selection / focus border | `#22aae0` | 2.66 | `#0b6aa0` | 5.86 |
| Selected reason bracket | `#00ff00` | 1.37 | `#1f7a4d` | 5.32 |
| Supporting line and label text | `#339966` | 3.57 | `#1f7a4d` | 5.32 |
| Opposing line and label text | `#ff0000` | 4.00 | `#c00000` | 6.48 |
| Evaluation-mark disc | `#22aae0` at 0.85 | 2.3 | `#0b6aa0` | 5.86 |

In dark mode every map colour clears its threshold except the badges
(about 3.6), which high contrast also fixes.

**View > High-contrast map colors** switches to the right-hand column.
It is a view preference under the same contract as dark mode
(`dark-mode.js`; `highContrastThemeJson` in `themes.js`; the badge and
disc rules in `argmap.css`): it is stored in `localStorage` as
`because.highcontrast`, it never alters map data, and printing keeps it.
WCAG 2.2 allows conformance through an alternate presentation that a
conforming control switches to (technique G174), so the authentic
default is not a 1.4.3 or 1.4.11 failure as long as this view exists and
works. The menu item is a `menuitemcheckbox`, reachable by keyboard like
every other View item.

Color is not the only cue in either view. Each bracket kind has its own
shape: a reason's bracket is rounded, an objection's square, and the
neutral connector's a flat bar (`squareCorners` / `noCorners` in
`themes.js`, read by the `appendOverLine` LOCAL PATCH in
`engine/vendor/mapjs/src/core/theme/connector.js`). The high-impact
themes also label brackets in words, implicit claims have dashed
borders, and selection is shown by border width and style as well as
colour. The shape changes apply only to this app's named themes; a map
with a fully embedded theme (historical MindMup exports) renders exactly
as saved. Authoring the neutral connector is off by default behind
**View > Allow neutral connectors**; rendering is never gated.

## Known limitations

1. **Connector curves are thin click targets.** Every connector action
   has an equivalent in the Argument menu (Edit connector label, Stronger
   connector, Weaker connector), and labelling also has a key, **L**.
2. **Toolbar hints use native tooltips.** Toolbar buttons expose their
   hint through the `title` attribute; the same text is each button's
   accessible name.

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
