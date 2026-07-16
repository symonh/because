# Because (formerly ArgumentBase) — status (2026-07-16)

Renamed ArgumentBase → Because late on 2026-07-16 (repo is now
github.com/symonh/because, local dir ~/Documents/GitHub/because). Legacy
infrastructure ids keep the old name: Firebase site `argumentbase`, GCS
bucket `argumentbase-app`, localStorage keys migrate on first load.
Canonical URL: **https://app.philmaps.com** (custom domain on the same
Firebase site; argumentbase.web.app serves identically).

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
