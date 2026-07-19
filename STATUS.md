# Because (formerly ArgumentBase) — status (2026-07-16)

Renamed ArgumentBase → Because late on 2026-07-16 (repo is now
github.com/symonh/because, local dir ~/Documents/GitHub/because). Legacy
infrastructure ids keep the old name: Firebase site `argumentbase`, GCS
bucket `argumentbase-app`, localStorage keys migrate on first load.
Canonical URL: **https://app.philmaps.com** (custom domain on the same
Firebase site; argumentbase.web.app serves identically).

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
