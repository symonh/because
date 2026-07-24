# Because (formerly ArgumentBase) — status (2026-07-24)

## 2026-07-24 — D on a reason/objection; connector labels move to the middle

- D used to do nothing when a bracket was selected. It now detaches the
  whole reason or objection — the bracket and every premise in it — which
  is what selecting a bracket means. Same engine path as before
  (positionNodeAt with a manual position); a claim behaves as it did.
- Two things had to follow for a detached bracket to look like anything:
  - numbering.js walked only the content root's non-group children, so the
    premises of a top-level bracket were never numbered and their badges
    vanished on detach. The root is now read with `premisesOf`, the same
    function that reads every other claim, so a detached bracket's
    premises are numbered as the top-level claims they now are. For a map
    with no detached bracket the walk is unchanged.
  - the MindMup theme already styles a detached bracket —
    `attr_group_supporting.level_1` / `attr_group_opposing.level_1`, a
    translucent green or red fill — but it never painted. A theme's
    COMPOUND styles reach a node only through the generated CSS
    (`nodeStyles` resolves flat names: attr_group, level_1 …), and
    update-node-content wrote the flat attr_group style's
    `background-color: transparent` as an INLINE style, which shadows any
    stylesheet rule. It no longer writes the property when the resolved
    value is transparent, so the cascade decides. Only groups resolve to
    transparent in these themes and their own rule says transparent too,
    so nothing else moves.
- Connector labels ("Because" / "But" / "Therefore") now sit halfway down
  the connector instead of a fixed 23px above the bracket, where the
  heavier high-impact lines put them on top of the arrowhead. New
  `midSpan` label position in calc-label-center-point: the y is the
  midpoint between the parent's base and the child's top, and the x still
  comes from the existing binary search along the actual curve at that
  height. The stock `ratio` position cannot do this — it measures along
  the whole path, and a group connector's path carries the bracket, so
  half its length lands on the bracket. Measured: 0px off the middle on
  all four connectors, still 0px from the line through the label's centre,
  6-9px clear of the arrowhead. argMappingSimple keeps MindMup's authentic
  aboveEnd placement (the fidelity rule); only the two high-impact themes
  changed.
- Vendor patches recorded in LOCAL-PATCHES.diff and engine/README.md;
  bundle rebuilt. Tests: app-e2e covers D on a bracket (whole reason
  detached, connector gone, manual position, premises renumbered, the
  level-1 fill actually painting, one undo restoring it) and the
  conclusion no-op; features-e2e asserts both themes put the label at the
  middle of the connector's span and that it no longer overlaps the
  arrowhead. All seven suites pass.

## 2026-07-24 — D detaches a claim from the tree

- `d` on a selected claim takes it, and everything beneath it, out of the
  tree: it becomes a root of its own standing free on the canvas. Also
  Edit > Detach from the tree.
- It is the keyboard equivalent of dragging a claim to a blank area and
  uses the engine's own path for that — `positionNodeAt(id, x, y, true)`,
  which reparents to the content root and pins `attr.position`, the .mup's
  own way of recording a detached root. The coordinates passed are the
  claim's current ones (from `getCurrentLayout`), so the claim stays put
  and the tree it left closes up around the gap; measured drift is 2px.
- If the claim was the last premise in its bracket, the empty bracket goes
  with it, in the same batch, so one undo restores claim, bracket and both
  connectors (drop-policy.js does the same for the drag; empty groups are
  invisible to the layout but would otherwise linger in the file).
- No-ops rather than surprises: a bracket is structure, not a portable
  unit, and the conclusion (or anything already detached) is a root
  already.
- Tests: app-e2e presses the key for real on a claim with a subtree
  (reparenting, subtree kept, old connector gone, manual position written,
  no jump), on a bracket's last premise (bracket removed, one undo
  restores both), on the conclusion and on a bracket (no-ops), and inside
  a title editor (types a letter); webkit-e2e covers detach + ⌘Z. All
  seven suites pass.

## 2026-07-24 — Shift+T toggles dark mode

- Keyboard path for the view preference that previously had only the
  topbar button and the View menu. Bound in shortcuts.js beside Shift+Z:
  bare `t` (toggle the selection) tests for the lower-case character, so
  the shifted key never reaches it, and Alt+Shift+T still means Alt+T.
- It runs through `commands.toggleDarkMode`, so the press is tracked by
  surface like every other key (`command`, method=shortcut) on top of the
  existing `dark_mode_toggle` event. That meant building darkMode before
  the command set in main.js — makeCommands takes it as a second argument.
- The topbar button now names the key in its `title` but not its
  `aria-label`: the accessible name stays the plain action.
- Tests: app-e2e presses it from the map (theme flips, map data and the
  implicit flag untouched — it is not bare t) and while editing a claim,
  where the contenteditable guard makes it type a capital T instead; the
  same flip in WebKit (webkit-e2e), since modified bare-letter keys are
  where Safari has bitten before. All seven suites pass.

## 2026-07-24 — Editable claim numbers

- The number badges keep computing themselves as before (level.index,
  breadth-first, groups and stickies skipped). New: clicking a badge opens
  a small editor on it, and whatever is typed there — up to 10 characters —
  replaces the number on that claim. The override is stored on the claim as
  `attr.claimLabel`, so it round-trips through .mup like any other node
  attribute and undo/redo covers it (it goes through the content
  aggregate's command processor). Clearing the text, or typing back the
  number the structure would give the claim anyway, removes the attribute.
- Overriding one badge never renumbers the map: the walk in numbering.js
  still counts the overridden claim, so its siblings and everything below
  keep the numbers the structure gives them.
- Two things had to give way for the click to land at all:
  - the decorations container swallows `mousedown`/`click` with
    `stopImmediatePropagation` (that is how mapjs keeps icon clicks from
    selecting or dragging the node), so number-edit.js listens in the
    CAPTURE phase — nothing bubbling ever sees that click;
  - a group is a 16px transparent strip sitting just above its claims and
    is created after them, so at the shared z-index 2 it covered the part
    of the badge that overhangs the claim's top edge, and every grouped
    claim's badge was unclickable. Claims now paint at z-index 3
    (argmap.css). The strip carries no visuals of its own — the bracket is
    SVG, below both — so nothing moved on screen, and clicking the strip
    still selects the group.
- The editor is fixed to the viewport and appended to `document.body`, not
  to the map container: that container's ARIA role is `tree`, which may
  hold none but treeitem children, and an input inside it fails axe's
  aria-required-children. Its blue is a shade darker than the badge's
  (#17789f) because white bold 12px is normal-size text for WCAG 1.4.3 and
  the badge blue only reaches 4.1:1.
- Keyboard path: **Edit > Edit claim number…** opens the same editor on the
  selected claim (switching numbering back on first if it is off). Enter
  commits, Escape cancels, and either way focus goes back to the map.
- Analytics: new `claim_number` event, `action` = edit/set/cleared
  (docs/analytics.md). The typed text is never sent — features-e2e asserts
  that a typed override does not appear anywhere in the event payload.
- Tests: a claim-number section in features-e2e (default numbering, the
  badge winning the hit test over its bracket strip, editor placement
  including on a scrolled map, the 10-character cap, storage in
  attr.claimLabel, siblings unaffected, the pill growing without clipping,
  undo/redo, Escape, clearing, re-entering the computed number, the menu
  path); a WebKit case for the whole click-type-Enter-undo cycle (the
  capture-phase click and a floating keyboard-driven input are exactly what
  breaks in Safari); an a11y case that the editor is named and focused,
  scans clean under axe, and returns focus on close. All seven suites pass.

## 2026-07-24 — High-impact upward theme (Therefore, arrows up)

- New View-menu theme "High-impact upward" (registry key
  `argMappingHighImpactUpward`; stored in attr.theme like the others). Same
  weight as the downward high-impact theme, but arrowheads point UP into
  the claim being supported/attacked and the connector labels read
  premises-first: "Therefore" on reasons, "Therefore, it is false that" on
  objections, hanging just below the parent claim instead of above the
  bracket. The existing high-impact theme is renamed in the menu to
  "High-impact downward" — its registry key stays `argMappingHighImpact`,
  so previously saved maps are untouched.
- Vendor patches (engine rebuilt, both hunks in LOCAL-PATCHES.diff):
  connector.js `arrow` key is now direction-aware ('to' = head at the
  child end pointing down, as before; 'from' = head at the parent's base
  pointing up — the S-curves leave the parent vertically, so the vertical
  head matches the line). calc-label-center-point.js gained `belowStart`,
  mirroring `aboveEnd`: label a fixed offset below the path START, x found
  on the actual curve at that height by the same binary search. The upward
  theme uses belowStart 35 (clears the 13px arrowhead barbs by the same
  ~4px the downward theme's aboveEnd-15 clears its arrow).
- Analytics: theme_select gains value `high_impact_upward`
  (docs/analytics.md). features-e2e: downward assertions renamed + a new
  arrow-direction check; new upward section (labels, width, up-pointing
  arrows at the parent end, label position, attr.theme round-trip).
  Verified visually against Simon's reference screenshot (Harrell Ch.3
  Ex.31), light + dark. All seven suites pass.
- Follow-up 1 (same day, Simon's screenshot): the heads were drawn with a
  fixed vertical stem, but on a wide fan the S-curve is well off vertical
  within the head's own 14px, so the join kinked. The head's angle now
  comes from the curve itself.
- Follow-up 2 (Simon's zoom, the fix above was not enough): measured the
  join — the line's direction there was still 47-52° off the head's axis,
  because the curve leaves a node VERTICALLY and only then hooks, and the
  4px square-capped stroke was running through the head: poking out of the
  head's side on the outside of the bend (the notch) and standing 2px past
  the apex over the node's border (the blunt tip). Fix: end the line where
  the head starts. line-types.js splits the quadratic at the point whose
  chord to the endpoint is one head length (`arrow-path.js` now exports
  `axisLength`), draws the shortened curve, and reports that point as the
  head's base, so head and line meet edge to edge along one axis. Seam
  mismatch is now 17-22°, the stroke no longer enters the head at all, and
  a vertical connector gets a clean sharp point. When the `to` end is
  trimmed the path ends with an absolute moveto back to the true endpoint,
  because the bracket overline is appended relative to the current point —
  features-e2e asserts the bracket sits identically in the trimmed
  (downward) and untrimmed (upward) themes, which is the guard for that.
- Follow-up 3 (Simon): the "Because" / "But" / "Therefore" labels grazed
  the underside of their lines instead of intersecting them. New label
  position key `centerOnLine` (update-connector-text.js) centres the text
  ON the anchor point, so the connector runs through the middle of the
  label and is masked behind it, as in the reference screenshot. Both
  high-impact themes set it, with the anchor moved half a label further
  along the curve (aboveEnd 15→23, belowStart 35→27) so the text keeps
  the position it had and still clears the arrowhead. The verbatim Simple
  theme and any map's own embedded theme are untouched — they never set
  the key, so their labels keep the historical placement.
- GCS mirror note: deploy.sh's Firebase deploy + git push succeeded, but
  the legacy GCS mirror step failed — active gcloud account is
  support@swaybeta.ai (no bucket access) and sc@simoncullen.org's gcloud
  token is expired; needs an interactive `gcloud auth login` from Simon,
  then rerun the two `gcloud storage rsync` lines from deploy.sh.

Renamed ArgumentBase → Because late on 2026-07-16 (repo is now
github.com/symonh/because, local dir ~/Documents/GitHub/because). Legacy
infrastructure ids keep the old name: Firebase site `argumentbase`, GCS
bucket `argumentbase-app`, localStorage keys migrate on first load.
Canonical URL: **https://app.philmaps.com** (custom domain on the same
Firebase site; argumentbase.web.app serves identically).

## 2026-07-19 — Keyboard shortcuts follow the character, not the QWERTY key

- Bug (Simon, Colemak-DH): ⌘C / ⌘V / ⌘Z did nothing in Because under a
  Colemak-DH layout though they worked in every other app. Cause:
  `shortcuts.js` matched ⌘/⌃+letter on `e.code` (the physical QWERTY
  slot), but macOS binds Cmd shortcuts to the CHARACTER — so once a
  layout moves c/v/z (and b/i/u/y) onto other physical keys, the `e.code`
  test missed and the shortcut silently died.
- Fix (`app/js/shortcuts.js` only): the ⌘/⌃+letter shortcuts (copy,
  paste, undo/redo, bold/italic/underline) now match on `e.key` (the
  character), so they follow wherever those letters are typed, exactly as
  native apps do. No QWERTY regression — `e.key` is the same letter there.
  Punctuation shortcuts (⌘⇧. / ⌘⇧,) stay on `e.code`: ,./ don't move in
  these layouts and a shifted-punctuation `e.key` is layout-noisy.
- Still physical-key-bound (separate, harder cases; menu/toolbar cover
  them): Alt+O / Alt+N (macOS Option rewrites `e.key` to a diacritic, so
  neither `e.key` nor `e.code` is clean) and the in-editor ⌘B/⌘I/⌘U/⌘Z
  applied to a text selection while typing (vendored `edit-node.js` keys
  off `e.which`/keyCode — would need a vendor patch + engine rebuild).
- Test: app-e2e fires ⌘C/⌘V/⌘Z with a `code` deliberately different from
  the `key` character (as a moved layout produces) and asserts they still
  fire. All seven suites pass.

## 2026-07-19 — Copy / paste subtrees as reasons (⌘C / ⌘V)

- ⌘C (⌃C) copies the selected claim and everything beneath it into an
  in-memory clipboard (a deep JSON snapshot via `content.clone`, so it
  survives the source being edited or deleted). ⌘V (⌃V) grafts that copy
  onto the current selection using the same argument grammar a drag uses
  (drop-policy): onto a claim it becomes a new reason in its own fresh
  green supporting group; onto a bracket it joins as a co-premise. One
  undo reverts the whole paste; the pasted node is selected afterwards.
- There is always a selection (the model falls back to the root idea), so
  paste always attaches — a pasted subtree is separated afterwards by
  dragging it to a blank area, so there is no "paste detached" branch.
- Groups (bare brackets) and sticky notes are not copyable (structure /
  annotation, not portable argument units); manual positions are stripped
  from the clipboard so a pasted subtree always lays out under its parent.
- App layer only: mapjs exposes `clone`/`paste` on content but no
  clipboard of its own (MindMup's cut/copy/paste lived in its closed app).
  `commands.js` holds the clipboard + `copy`/`paste`; `shortcuts.js` binds
  the keys (inert while a title editor is open, so ⌘C/⌘V copy/paste text
  there); Edit menu gained Copy / Paste as reason; `GROUP_ATTR` is now
  exported from `drop-policy.js` so paste and drag share one grammar.
- Tests: app-e2e drives ⌘C/⌘V (reason graft, fresh ids, nested subtree
  kept, pasted node selected, one-undo revert, no graft while editing,
  bracket-copy ignored); webkit-e2e repeats it with real Safari mouse
  selection + ⌘C/⌘V. All seven suites pass.

## 2026-07-19 — Microsoft OneDrive open/save/share (needs Entra app id)

- `app/js/onedrive.js` mirrors drive.js: Open from OneDrive… (in-app
  folder browser over Graph listings), Save writes back to the same
  file, Save a copy in OneDrive…, Share from OneDrive… (the file's own
  OneDrive page, popup-safe), Switch Microsoft account…, auto-save via
  the same save-override hook. Scope `Files.ReadWrite`, one code path
  for personal + work/school accounts.
- Auth: hand-rolled authorization-code + PKCE popup
  (`app/auth-popup.html` relays the code) — Microsoft's CDN stopped
  hosting MSAL at v2, so there is nothing to lazy-load; refresh token
  persists in localStorage (`because.onedrive.refresh`), account pinned
  via `login_hint` (`because.onedrive.account`). Microsoft's embedded
  picker was rejected (cross-site cookies — breaks in Safari). Content
  reads use `@microsoft.graph.downloadUrl` because `/content` 302s and
  CORS forbids that for Authorization-carrying browser requests.
- SHIPPED DARK: `onedriveConfig.clientId` is empty until Simon
  registers the Entra app (docs/onedrive-setup.md, ~3 min, portal
  login required); until then the OneDrive items show setup
  instructions. Seventh suite `test/onedrive-e2e.js` (Microsoft side
  stubbed); webkit-e2e covers the OneDrive picker panel + share popup
  in real WebKit.

## 2026-07-19 — File > Share from Google Drive

- New File menu item. On a Drive-bound map it opens the file's own
  drive.google.com page in a new tab — synchronously inside the menu
  click, so Safari's popup rules are satisfied — where the native Share
  button lives. On a local map it offers to save to Drive first, then
  shows a panel with a real link (a popup opened after the async save
  would be blocked in Safari).
- The embedded gapi sharing dialog (ShareClient) was rejected
  deliberately: Google documents it as requiring third-party cookies,
  which Safari blocks by default, and it fails there with no error
  callback to fall back on (google-api-javascript-client issue #514).
- Analytics: `drive_share` with `method` = `direct` / `after_save`
  (docs/analytics.md). Tests: drive-e2e covers all three paths
  (direct, decline, save-then-link); webkit-e2e now stubs Google's side
  and verifies both popups open in real WebKit via genuine clicks.

## 2026-07-17 night — NVDA bug: roving focus replaces activedescendant

- A colleague on Chrome + NVDA (Windows) reported the map unreadable:
  NVDA+Tab on the focused map announced "unknown invisible" instead of
  the claim. Root cause: the canvas used the aria-activedescendant
  composite pattern (DOM focus parked on the container, selection
  pointed at via IDREF) — Chromium's INTERNAL accessibility tree
  computes it correctly (verified via CDP in Chromium 129 and 150, all
  load paths), but NVDA has to follow the activedescendant indirection
  through the IA2 layer to find what to announce, and that retargeting
  is what failed. Not reproducible on macOS (NVDA is Windows-only); the
  computed-tree evidence plus the symptom pinned it to the indirection.
- Fix (app/js/a11y-canvas.js only, no vendor change): real DOM focus now
  rides the selected node (roving focus). The container stays the single
  Tab stop and delegates focus to the selection on receipt; arrows move
  focus with the selection, so screen readers announce claims from
  native focus events — the pattern every AT follows, and the one the
  vendor engine itself uses after inline edits (editingElement.focus()).
  Also: the positioning stage now carries role="group" so the ARIA
  required-children chain (tree > group > treeitem) doesn't route
  through a zero-sized generic. Guard: selection changes move focus only
  when focus is already inside the map, so map loads (which auto-select
  the root) can't steal focus from a dialog.
- test/a11y-e2e.js grew a Chromium section (system Chrome via
  playwright-core + CDP): asserts the COMPUTED accessibility tree — one
  tree named "Argument map", every node a named treeitem under a group,
  and real focus landing on a named treeitem when the map is focused.
  That's the NVDA proxy that was missing: every DOM-attribute check
  passed while the computed-tree consumer choked. 47/47 checks pass;
  all six suites green; round-trip serialization byte-identical after
  focus/arrows/dark-mode. docs/accessibility.md and the PDF report
  (docs/Because-Accessibility-Report.pdf) updated to match.
- Colleague asked to retest after deploy — NVDA-on-Windows confirmation
  is still pending; the fix is verified only at the computed-tree level.

## 2026-07-17 evening — objection bracket: shape, not just color

- Simon noticed reasons and objections were distinguished only by bracket
  color (green/red) — a 1.4.1 gap for colorblind users. The objection
  (opposing-group) bracket now has square corners; the reason
  (supporting-group) bracket stays rounded. `appendOverLine` in the
  vendored `engine/vendor/mapjs/src/core/theme/connector.js` (LOCAL
  PATCH, engine/README.md) now branches on a new `squareCorners` theme
  key, set on `opposing-group` in app/js/themes.js only — reasons are
  untouched. Same start/end points and span as the rounded path, just
  two straight segments instead of the quadratic-bezier corners, so it
  holds at both connector widths (3 in Simple, 4 in High impact) and
  with the high-impact theme's arrowhead/label.
- A map's own EMBEDDED theme JSON still wins over this named theme
  (resolveThemeJson), so a historical MindMup export with a fully
  resolved theme keeps rendering exactly as saved — this only affects
  this app's own argMappingSimple/argMappingHighImpact themes (the vast
  majority of maps, which reference a theme by name).
- Verified visually (lee-house.mup, both themes) and with a round-trip
  serialization check — engine rebuilt via engine/build.sh, only
  app/bundle.js changed (themes.js is a separate ES module, not
  bundled). About panel copy and docs/accessibility.md updated. All six
  e2e suites pass.

## 2026-07-17 — WCAG 2.2 AA remediation

- Full accessibility pass over the app chrome (docs/accessibility.md has
  the conformance notes, palette table, and documented exceptions; the
  map-canvas CONTENT still renders the authentic MindMup theme verbatim
  per the fidelity rule — chrome only was recolored).
- Keyboard model fixed at the root: shortcuts.js was intercepting
  Tab/Enter/z/t on WINDOW capture, so the toolbar and menus were
  unreachable by keyboard and Enter on a focused button added a reason
  instead of clicking it. Now map-scoped (body counts as map scope except
  Tab, which walks into the chrome). Skip link added; the vendor's
  positive tabindex=1 on the container normalized to 0, nodes to -1 —
  the map is one Tab stop.
- Menubar is a real WAI-ARIA menubar (buttons, roving tabindex, arrow
  keys, menuitemcheckbox/radio with aria-checked; menus.js). Every modal
  (info panels, intro, unsaved guard) goes through app/js/a11y.js:
  role=dialog, Tab trap, Escape, focus restore, and a focusin guard —
  needed because setIdea focuses the root node mid-load and was yanking
  focus out of the intro modal (engine.js deselectAll blur also scoped
  to map nodes for the same reason). Popovers (node-style, connector)
  manage focus + expose aria-pressed; Stronger/Weaker connector gained
  menu items so the click-a-connector popover is no longer the only path.
- Canvas semantics (app/js/a11y-canvas.js): container role=tree +
  aria-activedescendant, nodes role=treeitem with aria-level/-selected/
  -expanded, brackets get group labels, SVG layer aria-hidden. Arrows
  move SELECTION not DOM focus (composite pattern), so the visible
  keyboard indicator is a class the module holds on the active node
  while the container is focused. Serialization stays byte-identical
  (round-trip asserted with decoration active).
- Contrast: chrome accent #1a86b8 → #16749f for text (4.76–5.21:1),
  save-status #aaa → #6e6e6e / dark #a2a9b0, toolbar icon blues/yellow
  darkened (#1987b5, #8a7b00) for 3:1 non-text; same palette applied to
  the site pages. Focus-visible outlines everywhere; topbar/toolbar now
  wrap in a flex column (200% zoom / 640px reflow clean); reduced-motion
  honored; html lang, live-region save status, labelled everything.
- New gate: test/a11y-e2e.js (WebKit) — six axe-core scans (all states
  clean) + the whole keyboard walkthrough. All six suites pass.

## 2026-07-16 — Drive write-404 triage + hardening

- Field incident (Simon): a .mup opened fine from the Picker but every
  write to it failed with 404 "File not found" — fresh re-auth, same
  result, so not token expiry. Google documents that Drive masks
  permission problems as 404, and that shared-drive items 404 on update
  without `supportsAllDrives=true` (which reads may survive). Root cause
  on Simon's file still unconfirmed; the app now diagnoses it instead of
  guessing.
- Hardening shipped: `supportsAllDrives=true` on every file read/write
  plus shared-drive support in the Picker; opening a view-only file warns
  immediately and Save creates a copy instead of PATCHing; a write 404
  probes the file (trashed? view-only? invisible?) and offers "save as a
  new Drive file" with the reason and signed-in account named, replacing
  the raw error alert; token renewals carry a `login_hint` for the
  granting account so silent renewals can't migrate accounts.
- Account chooser fatigue (Simon's screenshot: multi-account Safari got
  the chooser on every visit): the granting account persists in
  localStorage (`because.drive.account`) and every token request carries
  it as the hint, so return visits skip the chooser (the token popup may
  still flash and self-close). File > "Switch Google Drive account…"
  (shows the connected email) clears the pin and forces the chooser once.
- Privacy fix found during this: the raw 404 text (contains the Drive
  file id) had been flowing into drive_error / auto_save_error analytics
  descriptions, against the stated contract. track() now masks any 25+
  char token in every string param.
- Doc drift fixed: README test instructions (five suites), LICENSE
  copyright name (ArgumentBase → Because), stale GA4 BLOCKED section
  here, analytics.md privacy rules.

## 2026-07-16 — File > Auto-save (opt-in)

- File > Auto-save (✓ toggle, preference persisted in localStorage as
  `because.autosave.auto` — an app preference, never map data). When on,
  each change debounces (1.2s) into a real save to the map's own writable
  target: the current Drive file, or a File System Access handle
  (Chrome/Edge). Maps without a writable target (drag-drop, fallback
  picker, ?src=, Safari local files) just stay "Unsaved changes" — the
  download fallback is manual-save only, so auto-save can never spawn a
  download per keystroke; enabling it targetless shows an explainer panel.
- Failure handling: a failed auto-save pauses the feature (status shows
  "Auto-save failed — use File > Save", no alert per change) and any
  successful save re-arms it. Edits landing mid-write keep the map dirty
  and reschedule. A pending auto-save flushes when the tab hides.
- drive.js: save() threads an `{auto}` option (map_save mode `auto`,
  silent rethrow instead of alert, never prompts); GIS token client got
  an `error_callback`, so a popup blocked outside a user gesture (expired
  token during auto-save) rejects instead of hanging the save forever.
- Analytics: map_save mode `auto`, new `auto_save_toggle` and
  `auto_save_error` events (docs/analytics.md updated).
- Tests: drive-e2e (coalesced PATCH, failure pause without alert, manual
  re-arm), features-e2e (targetless behaviour + toggle tracking),
  webkit-e2e (explainer, no download in real WebKit).

## 2026-07-16 afternoon

- **Deployed: https://argumentbase.web.app** (Firebase Hosting site
  `argumentbase`, project driveshare-446802; `./deploy.sh` stages app/ +
  samples/ into deploy/ and pushes to Firebase plus the legacy GCS mirror
  at storage.googleapis.com/argumentbase-app). Firebase gives a real
  origin, which Google OAuth requires.
- Drag-and-drop now follows the argument grammar (app/js/drop-policy.js):
  a claim dropped onto another claim becomes a supporting reason in a fresh
  green group instead of a naked child; dropping onto a group joins it as a
  co-premise; a source group emptied by the move is removed; one undo
  reverts the whole thing. Verified with a real mouse drag in Puppeteer.
- File > Open fixed (Safari never fired change on the detached picker
  input) and an unsaved-changes guard added: Open/New/drop show a
  Save / Don't save / Cancel modal, closing the tab warns, and the status
  text tracks the map relative to its FILE (localStorage autosave is
  crash recovery, not saving). Verified in Chrome and WebKit.
- Google Drive open/save built and wired (app/js/drive.js + config.js):
  Picker-based open of instructors' existing .mup files, Save writes back
  to the same Drive file, Save-a-copy creates one (drive.file scope only).
  Drive + Picker APIs enabled, restricted browser API key created and
  committed. Blocked on ONE manual step Google has no API for: Simon
  creates the OAuth web client in the Console — exact 2-minute checklist
  in docs/drive-setup.md. Until then the menu items show setup info and
  everything local keeps working. Stubbed-boundary e2e: test/drive-e2e.js.

## 2026-07-16 late night — GA4 analytics

- Google Analytics integrated (app/js/analytics.js owns all gtag contact;
  measurement id in config.js gaConfig). Event vocabulary + GA setup steps
  + custom-dimension list in docs/analytics.md. Highlights: every command
  tagged by UI surface (menu/toolbar/shortcut/style popover), one map_open
  taxonomy across all load paths (picker/drop/Drive/url/autosave/new) with
  node-count buckets, map_save by destination+mode, connector/node-style/
  theme/dark-mode/intro/help events, edit intensity batched into
  edit_batch (never per keystroke), deduplicated exception reporting,
  dark_mode as a user property. deploy.sh stamps the git hash into GA's
  app_version (repo copy stays 'dev').
- Privacy contract: events carry feature names/enums/counts only — never
  map content, titles, file names, or Drive ids (features-e2e asserts no
  leak). Global Privacy Control disables analytics entirely; localhost
  never sends (e2e traffic can't pollute the property) but events land in
  a local buffer: window.__because.analytics.events(). Debug/DebugView:
  localStorage because.ga.debug = '1'.
- The intro modal, landing page, and privacy policy claimed "no
  analytics" — all three updated to disclose the usage statistics
  honestly (privacy policy gained a full Usage analytics section; GA also
  added to the three site pages via the same module).
- RESOLVED later that night: measurement id G-HZZYZYH512 ("Because" web
  stream on app.philmaps.com) is in gaConfig.measurementId, deployed, and
  verified live (accepted /g/collect hits). Remaining GA console work:
  register the custom dimensions and set 14-month retention
  (docs/analytics.md). Background kept for the record: the old
  UA-106489762-1 was Universal Analytics, dead since July 2023.

## 2026-07-16 night

- FREEZE FIX (deployed immediately): the rich-text editNode rewrite had
  dropped reject() from cancelEditing, so an edit abandoned unchanged
  (Escape, or Enter-created node then click-away — Simon's Mini-0 repro)
  left the promise unsettled: input never re-enabled, new node never
  rolled back, all keys dead. Regression tests cover both paths.
- Themes now switch from the View menu (moved out of Argument
  Visualization). High-impact theme: group connectors/brackets width 4
  (bracket is part of the connector path so it thickens too), every
  reason auto-labelled "Because" / objection "But", and arrowheads
  pointing down into each group. Arrow support is a vendor patch:
  theme/arrow-path.js (extracted from link.js), `arrow` key on connector
  styles, rendered by update-connector like update-link's showArrows.
- setThemeByName ordering fix: the new theme must install BEFORE
  idea.updateAttr fires the rebuild — the old order re-rendered against
  the outgoing theme and menu theme switches only changed the CSS layer
  (visible as stale connector widths/labels).
- Stronger/Weaker now steps from the connector's actually rendered
  stroke width, so it works under either theme default (3 vs 4).

## 2026-07-16 late evening

- Topbar light/dark switcher (sun/moon button right of the save status);
  same state as View > Dark mode, persists as before.
- Rich text in claims: ⌘B/⌘I/⌘U toggle the whole selected claim, and
  format the text selection inside the editor (execCommand, normalised
  on commit); titles store a canonical minimal subset (<b>/<i>/<u>,
  entities escaped) so plain titles round-trip byte-identically.
  ⌘⇧. / ⌘⇧, step attr.style.fontMultiplier (the .mup-native per-node
  size). New vendor module src/core/content/rich-text.js, exported as
  MAPJS.richText.
- Right-click a node → style popover: background swatches (the palette
  Simon's maps already use) + custom colour, A−/A+, B/I/U. Writes
  attr.style.background; one undo step per change.
- Click a connector → MindMup-style Stronger/Weaker popover
  (attr.parentConnector.width, default 3, clamp 1–10) with an Edit-label
  tile; click a label (or double-click any connector, labelled or not)
  to edit its text. Root cause of "clicking labels does nothing": mapjs
  only fired lineLabelClicked on the SVG text glyphs, and an UPSTREAM
  BUG in DomMapController's stats recorder returned false from its
  listener, which the observable treats as "stop dispatching" — so app
  listeners registered after the controller never got connectorCreated
  & co. (patched; see LOCAL-PATCHES.diff).
- Dark mode fidelity on hand-coloured maps (80101-solution-rachels-foot):
  author-set attr.style.background / legacy backgroundColor /
  text.color now pass through darkenUserColor (hue-preserving lightness
  flip) at render time; legacy backgroundColor is now honoured in light
  mode too; connector-label masks follow the canvas colour instead of
  staying white. Map data stays byte-identical (features-e2e asserts).
- Connector labels ("but…") on busy levels sat left of their curves
  (solution-huemer-guns): aboveEnd labels now centre on the actual curve
  at label height (binary search on the path) instead of a fixed-ratio
  interpolation between node centres.
- Loading overlay for huge maps: engine.loadMap defers layout two
  animation frames behind an "Opening map…" spinner, ≥100 nodes only
  (a 68-node map lays out in ~140ms, so typical course maps never see
  it). mapLoaded now fires synchronously inside loadMap (drive.js file
  marker depends on that ordering).
- Google branding retry prep: / no longer 302s to /app/ —
  site/index.html is a static landing page (name, purpose, links to
  editor/privacy/terms), fixing all three verification findings
  (details in docs/drive-setup.md). First-visit welcome modal in the
  app ("Don't show this again"; Help > Welcome to Because reopens it).
- New test/features-e2e.js covers all of the above; webkit-e2e.js
  additionally drives rich text + right-click styling in real WebKit.
  All five suites pass. NOT yet deployed/committed at the time of this
  entry — deploy + commit follow.

## 2026-07-16 evening

- Cmd+Z/Cmd+Shift+Z bound (mapjs never had undo keys — Safari was
  reopening closed tabs); clean click now selects a node (mapjs
  dispatches nodeClicked and left acting on it to the app layer);
  vendored doubletap patch stops two quick clicks on different nodes
  opening an editor on the wrong node (test/click-select-e2e.js).
- Dark mode: View > Dark mode — body.dark chrome + render-time theme
  filter (app/js/dark-mode.js, darkenThemeJson in themes.js); defaults
  to OS preference, persists, prints light, never alters the .mup.
- app.philmaps.com pending: needs a Cloudflare DNS-edit token from Simon
  (zone philmaps.com), then Firebase customDomains.create + DNS-only
  records (grey cloud, so the apex→maps.simoncullen.org redirect rule
  can't catch it). API key referrers + drive-setup.md already include
  the domain.

## Original morning build notes

## Where things stand

The app works end to end: `app/` is a MindMup-style editor (menus, icon
toolbar, philmaps keyboard set, open/save/autosave) around the real mapjs
engine, rendering at MindMup fidelity. The overnight custom-renderer detour is
deleted; the engine path is the only path.

Fidelity is anchored to two primary sources rather than guesswork:

1. **The authentic theme** — `.mup` files saved by MindMup embed their resolved
   theme JSON; the argument-mapping theme was extracted verbatim from
   GeneticEnhancement.mup (colors `#707070`/`#4F4F4F`/`#339966`/`#FF0000`,
   badge spec `#22aae0` @0.8 pill with white ring, spacing h20/v60, 10pt
   NotoSans at 1.5 line height). Where screenshots and the theme disagreed,
   the screenshots turned out to be display-P3 color-shifted; the theme wins.
2. **Reference screenshots** (refs-local/, gitignored) — used to verify wraps,
   badge geometry, stickies (Architects Daughter — identified letterform by
   letterform), dotted note links, "because…" labels, evaluation marks.

Verified by side-by-side renders: the death map, GeneticEnhancement (real
file: fanning independent reasons, honored author widths and connector-width
overrides, comment links with arrows), the AGI map (deep nesting, stickies),
and recreated fixtures of the two label-off references (samples-local/
fixture-illusion.mup, fixture-shelter.mup).

## Engine changes (all in engine/vendor/mapjs/LOCAL-PATCHES.diff)

sticky_note class emission; theme-driven dotted connectors and default
connector label text; top-edge decorations (corner badges). Build needs
underscore aliased to its UMD file — see engine/build.sh for why.

## Not done yet

- GA console housekeeping (Simon, ~5 min — docs/analytics.md): register
  the custom dimensions so event params show in reports, and set
  14-month data retention. The measurement id itself is live
  (G-HZZYZYH512, verified end-to-end 2026-07-16).
- Drive OAuth client ID (Simon, Console, ~2 min — docs/drive-setup.md),
  then a live end-to-end Drive test with a real Google account.
- app.philmaps.com cert: DNS + custom domain done 2026-07-16 evening;
  confirm CERT_ACTIVE and that https://app.philmaps.com serves.
- PNG export (Print → PDF works); node-level notes side panel (`n` key);
  explicit link-drawing UI; the real argMappingHighImpact spec if a .mup
  embedding it turns up — check any old high-impact map before trusting the
  reconstruction.
- refs-local/ keeps the preserved reference screenshots (3=UI, 4/5=label-off
  maps). The image cache purges itself; save anything Simon drops immediately.
