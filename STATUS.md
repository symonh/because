# Because (formerly ArgumentBase) — status (2026-08-12)

## 2026-08-12 — Claim numbers that outlived their claims

- Reported as "Because sometimes adds extra claim numbers", with a second
  screenshot showing those numbers still on the map after claim numbering
  had been switched off, and no repro: the reporter could not say what
  move produced them. Nothing was wrong with the numbering. The badges
  belonged to node elements the stage had never let go of, and they sat
  where the deleted claim's own element had come to rest — on a bracket,
  which draws a bare line and hides an element lying under it.
- Four faults had to line up, and all four were latent from the start.
  **queueFadeOut wrote its safety-net `setTimeout` after the `return`**,
  so it never ran and removal rested on `transitionend` alone. That event
  does not arrive when no opacity transition actually starts — a node
  created and removed without an intervening paint is set from 0 to 0 —
  and an interrupted transition fires `transitioncancel` instead, which
  is what a dark-mode toggle does by rewriting the theme stylesheet
  under a fade in flight.
- **Idea ids are recycled**: `nextId` is `maxId() + 1` over the surviving
  tree, so once a leftover element is on the stage a later node can
  arrive holding its id. **`nodeWithId` looked the element up as `#id`,
  which jQuery resolves through `getElementById`** — measured, not
  assumed: two elements, `querySelectorAll` finds both and jQuery finds
  one. Every render path for a node goes through that lookup, so exactly
  one of the pair kept being drawn and the other froze holding the number
  it had. Switching numbering off travels the same path, which is why it
  could not reach the frozen one.
- **A bracket kept any badge it was handed.** The group branch of
  `updateNodeContent` skipped `applyLabel` rather than clearing, so
  nothing would ever touch that badge again. And **the drag shadow was
  cloned complete with the node's DOM id**, which is the same duplicate
  for as long as a drag runs and permanently if a gesture is interrupted
  before the shadow is taken down.
- All four are fixed in the vendored engine (LOCAL-PATCHES.diff,
  engine/README.md): the timeout runs and `transitioncancel` also
  removes; `nodeWithId` matches every element carrying the id, so a
  duplicate can no longer drift; `nodeCreated` clears a leftover before
  creating, so there is no duplicate to begin with; the group branch
  clears the badge; the shadow is cloned without the id.
- Gates: thirteen assertions in `features-e2e` — a node gone before it
  was ever painted, a fade cancelled by the dark-mode stylesheet swap, a
  planted twin element that has to be renumbered with its original, a
  claim turned into a bracket, a real drag, and the invariant they add up
  to (the stage holds exactly the nodes the map has, and numbering off
  paints no badge anywhere). Seven of them fail against the engine as it
  was. `webkit-e2e` repeats the fade and the drag in Safari's own engine,
  transitions and gestures being where both live.
- Two existing assertions were resting on the bug and had to be corrected
  rather than kept: `app-e2e`'s Alt+N sticky note and `a11y-e2e`'s Tab
  co-premise both pressed Escape — which takes an untyped new node back
  off the map — and then counted DOM elements. What they were counting
  was the cancelled node's element, still on the stage. Both now count
  what the map holds, before the cancel, and then check that the cancel
  removes it.

## 2026-08-03 — Connector labels are read aloud, and Escape leaves the map

- Two reports from an NVDA user, both real. **The labels on the
  connecting lines were never announced** while the arrow keys walked the
  map — audible while being typed (the editor is a named input) and
  silent thereafter. The cause is one line of a11y-canvas.js that is
  still correct: the SVG layer is `aria-hidden`, because the relations it
  draws are already in the tree. The label is not a relation, though; it
  is authored words, and they were in the hidden layer and nowhere else.
- The label belongs to the connector ARRIVING at a node — the `.mup`
  keeps it on the child as `attr.parentConnector.label` — so it is
  announced there, in whichever property does not displace a name that
  already exists. A bracket's name is ours to write, so the label joins
  it: "Supporting reasons (group), labelled Because". A claim's name is
  the claim's own text, so a claim's label rides in `aria-describedby`
  instead, pointing at a clipped span held OUTSIDE the container —
  `role=tree` admits only treeitem children, and a span inside a node
  would also be measured by the layout. The trigger is
  `connectorAttrChanged`, not `nodeAttrChanged`: the layout hands
  `parentConnector` to the connector rather than to the node.
- Left out on purpose: the theme's own default label. "Because" / "But" /
  "Therefore" are what the high-impact themes draw with no author input,
  and they restate what "Supporting reasons (group)" already says.
- **Escape now leaves the map.** Tab inside the canvas is the co-premise
  key, so it cannot also be the way out — which left the browser's own F6,
  found by the reporter and by nobody who has not gone looking. That is a
  WCAG 2.1.2 failure unless the user is told the way out, so there is now
  a way out worth telling: focus moves to the app menu (the menubar's
  roving title, or the one menu button the floating and mobile layouts
  hang the same spec behind), and Tab walks on through the chrome from
  there. It is stated twice — in the keyboard reference, and in the
  canvas's own ARIA description, which is where a reader entering the map
  will meet it.
- Escape only means that when nothing else is open that it already
  belongs to. Found by the suite rather than by reasoning: a menu dropped
  from a title CLICKED WITH THE MOUSE leaves focus in the map, so the new
  binding swallowed the Escape that closes it and the menu stayed up.
  `CLOSEABLE` in shortcuts.js names the six things Escape defers to.
- **L labels a connector**, which was the one part of an argument with no
  key at all: a thin curve to click, or the Edit menu. It runs through
  the same `editSelectedConnectorLabel` the menu item does, so a selected
  premise resolves to its own bracket either way, and the menu item now
  goes through the command too — both surfaces counted, neither able to
  drift. `l` is free in mapjs's own binding table and in ours.
- Gates: `a11y-e2e` for the announcement in WebKit and, because a label
  reaching a computed NAME is no guarantee that another reaches a
  computed DESCRIPTION, again in real Chrome's accessibility tree — the
  NVDA proxy that exists precisely because every DOM check passed while
  an NVDA user heard "unknown invisible". Plus the exit itself: out of
  the map, onto a real control, no map data touched, Tab carrying on from
  there, and the floating layout's fallback. `app-e2e` presses L for real
  and checks it is merely a letter while a claim is being edited;
  `webkit-e2e` drives the whole L → type → ⌘Z → Escape cycle in Safari's
  own engine, a bare letter opening a floating input being the exact
  shape of every Safari bug this project has had.
- One pre-existing race surfaced on the way: `loadMap` defers centring,
  `resetView` and `deselectAll` by 250ms, and `resetView` reselects the
  root — app-e2e's connector-label section was driving the selection
  inside that window and only now ran fast enough to lose.

## 2026-08-03 — A claim can be inserted attached to nothing

- **Insert > Detached claim.** Until now a claim standing free on the
  canvas could only be had by making a reason and dragging it out of the
  tree, which is a two-step workaround for something the argument grammar
  allows outright: a claim nobody has attached yet.
- `addDetachedClaim` writes exactly what that drag writes — a child of the
  content root carrying `attr.position` — so nothing else had to learn
  anything. The layout draws it as a root, the numbering gives it a
  top-level number (1.2 beside the conclusion's 1.1), and the `.mup`
  records what MindMup's own format already recorded for a detached node.
- It lands past the right edge of everything drawn, level with the top of
  the map, so it never covers what is there and a second one lands clear
  of the first. Off screen is fine: selecting it scrolls it into view,
  which mapjs does on every selection change. It opens for typing at once,
  and Escape instead of typing leaves nothing behind — the add and the
  position are one batch, so mapjs's own undo-on-cancel takes back both.
- Gated in both engines: `app-e2e` for the data, the placement, the
  numbering, that no connector touches it, and the undo/Escape paths;
  `webkit-e2e` because a menu click that hands focus to a contenteditable
  is the exact shape of every Safari bug this project has had.

## 2026-08-03 — Safari blocks the Picker's cookies, and the app says so first

- With My Drive as the opening tab, **Safari showed Google's "Can't access
  your Google Account" page where the file list should be**, while Chrome
  showed the files. This is not our code: Safari has blocked cookies for
  any site other than the one in the address bar since 2020, the Picker is
  a `docs.google.com` frame inside our page, and without a storage-access
  grant Google refuses to draw it. Allowing cookie access when Safari asks
  fixes it immediately and Safari remembers the grant; Chrome still allows
  the cookie and never shows that page at all.
- **The root pin is load-bearing in WebKit.** Bisected by hand in a live
  Safari with the grant already given for that origin: the My Drive view
  *without* `setParent('root')` still failed where the pinned one worked.
  One trial, so not a law — but the pin costs nothing and `drive-e2e` now
  asserts it, so the unpinned view cannot come back by accident.
- Google's page names neither the cause nor the fix, so `drive.js` says it
  first: a one-time note before the Picker opens, WebKit only, remembered
  in `localStorage` as `because.drive.cookienote`. Same shape as the print
  dialog's Safari note — `webkit-e2e` asserts it appears, that it precedes
  the Picker, and that it is not repeated; `drive-e2e` asserts Chrome never
  sees it, where it would be both a lie and an extra click.

## 2026-08-03 — One stalled request could hang the editor silently; now it can't

- Simon reported the editor hanging for minutes on opening, intermittently
  and with nothing in the console — and it happened in private windows,
  so it was not his data. Measurement cleared the obvious suspects:
  Firebase answers `/app/` in 126ms and the 771KB bundle in 331ms with no
  redirects, eight cold WebKit loads of the live app ran 614–1468ms, a
  935-claim autosave restores in 1.7s, and blackholing googletagmanager —
  a request that never answers and never fails — costs the editor
  nothing (1959ms to a drawn map), so the lazy gtag load really is
  non-blocking.
- What did reproduce it exactly: stalling **one** app asset. The editor
  makes 36 same-origin requests, 32 of them JS and CSS, and every one was
  served `no-cache` — only the two fonts were cached. Nothing in
  `app/index.html` paints on its own either, since the chrome and the map
  are both built by JavaScript. So a single request that hangs leaves the
  browser with nothing to draw: no chrome, no error, and in Safari the
  *previous* page still on screen, which reads as a freeze rather than a
  wait. In the test a blackholed module produced exactly that, with no
  end to it.
- Two changes, neither of which needs the root cause named (the stall
  itself is a network event — DNS, Wi-Fi, an edge that drops a
  connection). First, `firebase.json` serves `**/*.@(js|css)` as
  `public, max-age=300, stale-while-revalidate=86400`: a browser that has
  opened the editor before boots it from cache without touching the
  network at all, and the revalidation that follows happens in the
  background. HTML stays `no-cache`, so a deploy is picked up on the next
  load and the worst case is five-minute-old JS, refreshed behind the
  reader's back.
- Second, `index.html` carries an opening state — the mark, "Opening the
  editor…", and after eight seconds a line saying a file has not arrived
  and the page can be reloaded. Its styles are inline so it never waits
  on a stylesheet of its own, it reads the dark-mode preference straight
  from `localStorage` so a dark session does not open on white, and
  `main.js` removes it as soon as the chrome exists — not when a map
  finishes drawing, because a map fetched over the network (`?src=`) may
  never finish and the editor is usable either way.
- `webkit-e2e` holds the whole story: with `js/engine.js` stalled the
  opening state stays up with its notice hidden, no map ever arrives, the
  notice appears after eight seconds, and on a healthy load the block is
  gone by the time the chrome is up.

## 2026-08-03 — The Picker opens on My Drive, not on the shared drives

- **Open from Google Drive opened on the shared-drive list**, with the
  user's own files nowhere in the dialog: for an instructor in a domain
  with shared drives, the only tab was "Shared drives" and their own
  `.mup` files were unreachable without searching for them. The cause is
  what `setEnableDrives` means. It reads like "also allow shared drives",
  and it is the opposite — Google's reference says "if true, only shared
  drives are included in the view" — so setting it on the one `DocsView`
  the app built turned that view, and therefore the picker's only tab,
  into the shared-drive browser.
- `pickFile` now builds one view per tab: **My Drive first**, pinned with
  `setParent('root')` so it starts where Drive starts, and the
  drives-restricted view second, keeping shared drives one click away.
  Views become tabs in the order they are added and the picker opens on
  the first. Both carry the same folder and mime-type filters, and
  `SUPPORT_DRIVES` stays on the builder so a file chosen from a shared
  drive still opens.
- `drive-e2e` asserts the tab order now — its Picker stub records what
  was configured on each view, so a view that is drives-only, or first,
  fails the run. What the stub cannot see is Google's own labelling of
  the tabs; the Picker needs a real sign-in, so that is a by-hand check
  on the live app (or on localhost:8871, which is in the API key's
  referrer list).

## 2026-08-03 — Safari's sheet belongs to Safari, and the dialog says so

- Shipping the print work turned up the one case the headless gates
  cannot reach: **in Safari a wide map still printed portrait**, small
  and pushed to the top of the sheet, because Safari never took the
  orientation `@page` asked for. Three probes, printed from Safari 18 by
  hand, established that this is not a syntax problem: `size: landscape`,
  `size: A4 landscape` and an explicit `size: 279.4mm 215.9mm` all leave
  the sheet US Letter portrait, with the dialog's own Orientation control
  still on Portrait. All three parse — they round-trip through CSSOM —
  and Chrome honours the same declaration. WebKit takes the page from
  NSPrintInfo and the stylesheet does not get a vote.
- A layout that adapted to the sheet it was actually given was the
  obvious fallback, and it is not available either. **Print media queries
  cannot see the page box in either engine.** Chrome answers them from
  the paper as chosen before CSS is applied — with `size: landscape`
  honoured and the PDF landscape, `print and (min-width:)` still reports
  Letter portrait. WebKit answers them from the *browser window*: probe C
  printed "orientation: LANDSCAPE, width >= 320mm, height >= 260mm" onto
  a portrait Letter sheet, which is the size of the Safari window it was
  printed from. So there is no measurement a page can take of the paper
  it is being printed on.
- What the sheet does instead: the box is centred horizontally with
  `margin: … auto`, which needs no measurement, and pushed down by half
  the vertical slack of the *smallest* sheet it was cut to fit (5mm
  landscape, 2mm portrait). An earlier version centred with
  `height: 100vh` and flexbox — correct in Chrome, where viewport units
  do resolve against the page box, but it would have run onto a second
  page in any engine resolving them against a tall window, which is
  exactly what WebKit does with media queries. A fixed offset cannot
  paginate: the real sheet is never smaller than the one it assumes.
- And the part no code can fix is now said in words: on WebKit the print
  dialog reads "Safari takes the paper orientation from its own print
  dialog rather than from the page, so a wide map needs Landscape chosen
  there as well." Chrome, which does honour the orientation, never sees
  that sentence — `webkit-e2e` asserts the note is there and
  `features-e2e` asserts it is not. Simon confirmed the printed result
  with Landscape chosen in Safari's dialog: the map fills the sheet.

## 2026-08-03 — Printing lays the page out itself instead of hoping

- **Printing sent the paper whatever happened to fall under its
  top-left corner.** File > Print was `window.print()` plus a print
  stylesheet that hid the chrome; the browser then printed the document
  as it is laid out, and `#map-container` is a scrolling viewport with a
  mostly empty stage inside it and the map parked at whatever pan the
  user left. A map sitting right of centre printed a blank sheet; a map
  near the stage origin printed and was cut off at the page edge.
  Dragging the map left is not a fix, since a map wider than the paper
  runs off it wherever it starts. mapjs never had a print path — MindMup
  rendered its PDFs server-side in the closed app layer — so `print.js`
  is that path, written the way the rest of `app/js/` fills those gaps.
- **What it does**: at `beforeprint` it measures the map's real extent
  from the rendered DOM (every node rect and every connector shape,
  divided back through the stage's own zoom), then writes `#print-css`:
  a `@media print` block that cuts `#map-container` to a page-sized box,
  centres it with `margin: 0 auto`, and transforms the stage so the map
  lands inside it, scaled to fit and centred. Measuring the DOM rather
  than the model means brackets, arrowheads, connector labels and
  sticky notes are inside the extent without this knowing about them.
- Hanging it on `beforeprint` rather than on the menu item is what makes
  ⌘P, the browser's own print menu and File > Print produce the same
  sheet. The menu item now opens an options dialog — *Fit the whole map
  on one page* (default) or *Full size, on a page as large as the map*,
  MindMup's own "fit to map", plus orientation — and the choice persists
  in `localStorage` as `because.print`.
- **The paper is the browser's business and it never tells us which is
  loaded**, so fit-to-page targets 255×180mm: the box A4 (210×297) and
  US Letter (216×279) both contain, in either orientation, with ≥10mm of
  margin left over. `@page` declares an orientation and a margin and
  never a paper size, which would fight the user's own choice in the
  print dialog. Full size declares `size: <w>mm <h>mm` instead and
  prints at 1:1; if the map is bigger than a page can be (Chrome stops
  at 200in) it shrinks rather than clips.
- Nothing outside `@media print` changes, so a stale rule cannot affect
  the screen. The only live-DOM changes are the container's scroll
  offset and the selection outline — both view state, never map data —
  restored on `afterprint`, again on the next animation frame (the
  screen layout is not always back when the event fires, and a
  page-sized container clamps the offset to zero), and by a 60-second
  fallback timer for a print cancelled without an `afterprint`.
- **Three things only measuring real PDFs would have found.** First,
  mapjs pans by *animating* `scrollTop`/`scrollLeft` (`viewPort.animate`
  in `dom-map-controller.js`), and dark mode's flip to light for
  printing triggers a rebuild that starts one — it was still writing
  offsets while the sheet was being laid out, sliding a 53-node map
  clean off the page. The container is `overflow: clip` in print (not a
  scroll container at all), the animation is stopped and the offset
  zeroed. Second, **Chrome shrinks a document wider than the paper to
  fit it**, and it counts the stage's off-page extent towards that width
  even though the box clips it: a wide map came out at two thirds of the
  size it had been fitted to. `contain: strict` on the container is what
  stops the contents counting — safe precisely because the box's width
  and height are explicit. Third, a fallback built on print media
  queries was abandoned: with `@page { size: landscape }` honoured and
  the PDF landscape, `print and (min-width: …)` still reported Letter
  *portrait*, so the queries cannot see the page they are printing.
- Where it degrades: an engine that ignores `@page size` prints on
  whatever sheet the user chose, and if that is portrait the 255mm-wide
  box is wider than the paper — the browser's own shrink-to-fit then
  makes it smaller but still whole. WebKit parses both `size` forms
  through CSSOM and supports `overflow: clip` and `contain: strict`
  (webkit-e2e asserts the last two), so Safari should take the declared
  orientation; that is the one part of this that cannot be tested
  headlessly, since Playwright's WebKit cannot print.
- Gates: `features-e2e` prints real PDFs through `page.pdf` (which fires
  `beforeprint`/`afterprint`, so it exercises the ⌘P path) and asserts
  one page, a landscape MediaBox, a full-size page cut to the map, and
  that the pan and the selection come back; both it and `webkit-e2e`
  assert that every node and connector of a panned map lands inside the
  page box; `a11y-e2e` scans the dialog in light and dark.

## 2026-08-03 — Drive's Picker broke on Google's side; the key needed docs.google.com

- **"There was an error! The API developer key is invalid."** filled the
  Picker dialog for every Drive open, with nothing in this repo touched:
  `config.js` and `drive.js` are unchanged since the OneDrive commit, and
  the deployed `config.js` is byte-identical to the local one. The
  project was healthy too — ACTIVE, billing on, Drive **and** Picker APIs
  enabled, the key alive with exactly the restrictions the docs claimed.
- The check that mattered is not the one the config comment described.
  The Picker validates `setDeveloperKey` from inside its own
  `docs.google.com/picker` frame, so the referrer it presents is
  docs.google.com, not app.philmaps.com. Bisected with throwaway keys
  against the live app: `app.philmaps.com/*` alone → rejected; bare
  origin without `/*` → rejected; `docs.google.com/*` alone → works; no
  referrer restriction → works. Adding `https://docs.google.com/*` to the
  existing key fixed it, no deploy required. Full truth table and the
  gcloud repair command: docs/drive-setup.md.
- Consequence worth stating plainly: the referrer list no longer pins the
  key to this site. What keeps it publishable is that an API key opens no
  files — `drive.js` uses it only for `setDeveloperKey`, and every read
  and write travels under the user's OAuth `drive.file` token — plus the
  API restriction capping a stolen key at Drive + Picker quota.
- The test suite could not have caught this and still can't: `drive-e2e`
  stubs the token and never reaches Google, and the Picker needs a real
  sign-in to exercise. It was found by driving the live app in a browser,
  which is the only way to find it again.

## 2026-07-29 — The landing page's map is a real map now

- The hero showed a hand-built imitation: white boxes in a tinted green
  panel captioned "CO-PREMISES", a bright blue conclusion, a straight
  2px line. None of it was the grammar the app draws, and it could
  drift from the app without anything noticing. PhilMaps had already
  solved this properly — its figures are live argument maps rendered
  from map JSON against *this* app's theme (its own comments cite
  `app/js/themes.js`) — so the component came home. `figures/lib/` is
  the ported renderer, `site/css/argmap.css` and `site/js/argmap.js`
  the served figure, `docs/figures.md` the whole contract.
- Pre-rendered and committed rather than drawn at runtime. A figure has
  to be right with JavaScript off and must not jump when the script
  lands, so the markup has to be in the HTML: `figures/build.mjs`
  renders it between `<!-- argmap:id -->` markers and writes the `.mup`,
  and both outputs are committed, which keeps `deploy.sh` doing nothing
  but rsync. `--check` fails on drift; deploy.sh and site-e2e run it.
  Measured cost of the two states differing: one pixel of canvas height
  (267 → 266), because the CSS fallback stem and the SVG curve land on
  the same bracket line by construction.
- The figure hands the map over. "Download .mup" serves the generated
  file and "Open in the editor" is `/app/?src=/maps/home-aging.mup` —
  the `?src=` loader main.js already had, which until now only tests
  used. site-e2e loads that generated file in the app and reads the
  three claims back out, so the export cannot rot silently.
- The third connector came along. PhilMaps predates `neutral`, so the
  renderer, the describer, the .mup writer and the CSS all learned it:
  `GROUP_KINDS` mirrors numbering.js, and the bracket is a bare flat bar
  — rounded reason, square objection, flat neutral, the same shape
  distinction `connector.js`'s `squareCorners` / `noCorners` make in the
  app, so accessibility.md exception 1 still holds on the site.
- Left in PhilMaps deliberately: the lesson layer (keyed demos, the
  strength popover, quiz cards). This site has no lessons, and dead code
  no gate exercises rots. The data model is identical, so it can come
  over unchanged later; docs/figures.md says where.
- Two things the new gate turned up. WebKit was reporting
  "ResizeObserver loop completed with undelivered notifications" —
  laying out resizes the boxes being observed, so the relayout now waits
  a frame before running. And with the scroll-reveal animations
  disabled (which is how axe should see the page — otherwise it reads
  mid-fade copy as low contrast), axe found two real
  `link-in-text-block` failures that predate all of this: the About
  block's inline links were distinguished by colour alone. Prose links
  are underlined now.
- Also gone: `aria-hidden="true"` on the hero panel. The old mock was
  decoration; the figure is content, with tree semantics matching
  `a11y-canvas.js` (`aria-level`, `aria-selected`,
  `aria-activedescendant`), one tab stop, arrow-key navigation, and a
  `describe.js` prose alternative naming every claim by number.
- The legend went the same way (Simon, same day). The three cards under
  "See the shape of an argument" were tinted panels with white pills —
  imitation grammar sitting directly under authentic grammar, and no
  neutral kind anywhere. They are now real maps: one running argument,
  "Lying is wrong." because "Lying is manipulative." and "Manipulating
  people is wrong.", shown as a reason, as an objection ("Lying can make
  you rich."), and with the moral principle left implicit — which is
  exactly the sort of premise an author does leave unstated. A second
  figure kind, `inline`, renders them — inert,
  unnumbered, aria-hidden (each card's heading and sentence already say
  what its map shows) and drawn at 13px, which the layout engine scales
  every constant off, so the whole drawing shrinks coherently rather
  than being squeezed by the fit ladder. One `min-height` keeps the
  three panels level.
- A claim box was splitting words down the middle: "manipulativ / e.",
  because a wrap cap narrower than the longest word left
  `overflow-wrap: break-word` as the only out. The floor is
  `min-width: min-content` — min-width beats max-width, so the box
  widens rather than breaking the word, and `break-word` (which does not
  feed min-content sizing) goes back to being a last resort for a word
  wider than the canvas. **Scoped to `.am-abs`**, though: on the flow
  fallback's flex item, WebKit sized the `.am-node-wrap` cell from the
  claim's UNCLAMPED max-content width the moment a min-width keyword
  appeared — 346px instead of 223px — so co-premises drifted 74px apart
  under a bracket stretched over the gap. Chrome was fine, which is the
  third time this project has been caught by a Chrome-only reading. The
  suite now walks every word of every claim and fails if its rendered
  rects are not contiguous, in both states and both engines (a hyphen is
  a legal break, so "ticking-bomb" counts as two words).
- Which leaves `claimMaxCh` doing double duty: the fit ladder's starting
  point, and the wrap cap the no-JS fallback uses verbatim with nothing
  to widen it. So it has to clear the map's longest word — 15 for these,
  where 13 broke "manipulative." on the JS-less render.
- Deployed. First build of the landing page whose figures the deploy
  itself verifies: `deploy.sh` now runs `figures/build.mjs --check`
  before staging, so a page rendered from a stale map JSON aborts the
  upload under `set -e`.
- The social card was the last imitation left, and the one nobody looks
  at: `site/og.png` still showed the tinted-panel mock, so every shared
  link previewed a map the site no longer draws. `docs/og-card.html` now
  renders the hero's own map through the real component — a third figure
  kind, `card` (framed canvas, no caption bar, nothing to click in a
  screenshot) — and `test/og-shot.js` writes the PNG. It shoots with
  reduced motion, because the first attempt caught the map mid-fade and
  shipped it half-drawn; it now refuses to write at all if the map is
  clipped, scrolling, mid-fade or unhydrated. Pointing the card at
  `figures/maps/home-aging.json` is the point: the og:image cannot drift
  from the page it previews again.
- Relicensed PhilMaps MIT (Simon, 2026-07-30) — text and figures as well
  as code, where it had been CC BY-NC 4.0. That settles the open question
  from the port: the argument-map component now sits under identical
  terms in both repos, rather than an NC-licensed copy having been
  brought into an MIT one. Its `content-source/` scrapes still quote the
  old CC line, which is correct — they record what
  maps.simoncullen.org said, not what the site now offers.
- All eight suites pass, including the new `test/site-e2e.js` in both
  engines.

## 2026-07-29 — A third connector: neutral, off by default

- Feature request: an uninterpreted connector, "empty of content", so a
  map can say a claim ANSWERS a question, or that a question is motivated
  by a claim, without asserting support or opposition. The requester's
  term for the practice is reasoning mapping — argument mapping plus
  questions, which lets a map state the question at issue, frame rival
  claims as answers to a common question, object to a question that fails
  some criterion, and pose questions the reasoning has raised.
- `attr.group: 'neutral'`, alongside `supporting` and `opposing`. Nothing
  in the engine needed teaching about the value: `theme.nodeStyles`
  already derives `attr_group_<value>`, so the theme's new
  `attr_group_neutral` / `neutral-group` entries were enough to make it
  render. numbering.js is the one place that listed the kinds by name
  (brackets are structure, not claims, so they are skipped and never
  numbered) — it now reads a `GROUP_KINDS` list.
- Shape, not just colour. docs/accessibility.md exception 1 claims each
  bracket kind is distinguishable with colour perception removed, which
  was true of two kinds (`squareCorners` made objections square in July)
  and would have quietly stopped being true with a third. So connector.js
  gained the companion flag `noCorners`: a bare bar, no turns, at the
  same y and over the same span as the square one. Rounded = reason,
  square = objection, flat = neutral — which is also exactly how the
  requester drew it. features-e2e measures the three path tails and the
  bars' insets rather than trusting the flags.
- `#0070C0`, sampled from the requester's own figure (the dominant blue of
  9244 blue pixels; the PNG is sRGB-tagged, so the display-P3 caveat on
  Simon's screenshots does not apply). It holds 5.1:1 on white — better
  than the authentic green (3.6:1) or red (4.0:1) — and 5.3:1 on the dark
  canvas as `#4aa3e8`, so unlike green and red it needed no separate
  darkening for the chrome icons. This is the first group colour that is a
  local addition rather than an extraction; MindMup had no neutral bracket.
- Alt+Q, not Alt+N: Alt+N was already the sticky note, and Q is for
  question. T keeps its two-way reason ⇄ objection flip rather than
  cycling through three states — the key students learned does not change,
  and a neutral bracket falling to supporting under T is not a dead end
  because Alt+Q is the way back.
- Off by default, behind **View > Allow neutral connectors** (Simon's call
  after seeing it working). With it off the app is the app it was: no icon
  in any of the four button strips, no Insert item, no row in the keyboard
  reference, and Alt+Q not intercepted at all, so the key still reaches
  the browser. `commands.addNeutral` is guarded too, for anything reaching
  it directly. Turning it on rebuilds the toolbars the same way a layout
  change does. The preference is `because.neutral` in localStorage,
  built like dark mode and the layout choice, and never touches map data.
- What the preference deliberately does NOT gate is RENDERING. The theme
  keeps its neutral styles either way, so a .mup that already uses the
  connector opens drawn correctly for everyone — gating the theme too
  would have repainted those brackets green (an unrecognised `attr.group`
  falls back to `attr_group`, whose connector is supporting-group), which
  is far worse than one icon somebody did not ask for. features-e2e loads
  such a map with the preference off and checks it still draws blue.
- The keyboard reference keeps the Alt+Q row in `SHORTCUT_GROUPS` whatever
  the preference says — the drift check reads that table and the binding
  is in shortcuts.js either way — but filters it out of the rendered table
  while the feature is off, via a `needs: 'neutral'` flag. A reference
  listing a key the app ignores just reads as broken.
- Test-setup gap found on the way: `test/package.json` never listed
  `axe-core`, which a11y-e2e requires. Now a devDependency, so the suite
  can be set up from the manifest.

## 2026-07-29 — The toolbars were unreachable by keyboard in Safari

- Found while running the suite for the neutral connector: a11y-e2e failed
  two assertions on clean `main` — "the third Tab stop is a rail button"
  and "rail buttons draw a focus-visible ring". One bug, two symptoms, and
  a real one rather than a test artefact.
- WebKit leaves a `<button>` out of the sequential focus order unless it
  carries an explicit `tabindex` (on macOS, Safari's "Press Tab to
  highlight each item on a webpage" is off by default). None of the button
  strips set one, so in Safari Tab went skip link → menubar → straight
  into the map and the rail could not be reached by keyboard at all: WCAG
  2.1.1, in Simon's own browser. The menubar was fine only because
  menus.js gives its titles a tabindex for the roving pattern. The focus
  ring was never broken either — `:focus-visible` gives the right 2px
  `#16749f` on a rail button reached with `.focus()`. Nothing could put
  focus there to show it.
- Fixed by giving each strip the WAI-ARIA toolbar pattern its
  `role="toolbar"` was already promising: one Tab stop, arrows plus Home
  and End moving between the buttons, the stop following the last one used
  (`applyToolbarRoving`, toolbar.js; the same shape menus.js uses for the
  menubar). The roving button's `tabindex="0"` is what makes WebKit
  include the strip. The two chrome buttons outside a strip — the theme
  toggle while it is in the top bar, and the floating layout's menu
  button — carry `tabindex="0"` directly. Dialog buttons needed nothing:
  `initModal` moves focus itself instead of relying on the tab order.
- Side effect worth knowing: in Chrome the rail used to be 16 separate tab
  stops and is now one. That is what the APG pattern asks for and it takes
  15 stops out of the page's tab order, but it IS a change for anyone who
  was tabbing through the buttons — arrows now do that.
- a11y-e2e covers the pattern itself now (single tab stop, arrow/Home/End
  walk, and Tab still leaving the strip rather than trapping focus), so
  this cannot regress into "the ring is fine, nothing can reach it" again.

## 2026-07-27 — Objections to an inference can be labelled

- A reason or objection whose parent is itself a bracket answers the
  inference rather than the claim, and draws as a bare coloured bar under
  the bracket it answers (select a bracket, add an objection). It could
  not be labelled, though the rest of the argument's inferences could.
- Nothing was missing from the rendering: the theme carries
  `no-connector.supporting-group` / `no-connector.opposing-group` styles
  for exactly this connector, and a label set on it already drew in the
  right place — centred on the bar, resting just above it. What was
  missing was any way to reach it with the mouse. That connector's path
  is a single point, so there is no curve and no hit line to click, and
  the label renders in the strip its PARENT bracket occupies, which is a
  node (z-index 2) sitting above the SVG the label is drawn in (z-index
  1). Neither the label nor the space where one would go took a click.
- New in label-edit.js: the label band, the part of a bracket's strip
  that overhangs a bracket nested under it — the child bracket's width,
  one strip height above its bar, which is where the label renders. The
  layout leaves no gap between the two, so that rectangle is exact and
  needs no element of its own; it is read from live bounding rects at
  event time, so zoom and scrolling need no upkeep. Clicking it opens the
  same editor the other connector labels use, on the same
  attr.parentConnector.label. The mousedown is suppressed first, so the
  bracket owning those pixels is neither selected nor dragged; the rest
  of that strip still selects it, and the nested bracket's own strip
  below the bar still selects the nested bracket. The pointer reads as
  text over the band. Edit > Edit connector label… already reached this
  connector with the nested bracket selected — that is the keyboard path
  and it is unchanged.
- Room for the label (Simon: the first cut was cramped — the text was
  wedged between the parent's bracket and its own bar, touching both).
  A LABELLED nested bracket now drops 12px, taking its premises with it;
  the claims beside it stay on their level, and an unlabelled one is
  exactly where it was. That needed the layout, not the renderer:
  alignGroup offsets a nested bracket by its parent's height and nothing
  else, so a vendor patch (`calculate-top-down-layout.js`, threaded
  through `calculate-layout.js`) reads a new theme spacing key
  `layout.spacing.nestedGroupLabel` and adds it to the nested subtree's
  verticalOffset when that bracket carries a connector label. The label
  itself moved off the bar too — `aboveEnd: 5, ratio: 1` in place of
  `ratio: 0.5`, which keeps it centred on the bar (the aboveEnd branch
  interpolates to the child's centre at ratio 1) and lifts it clear.
  Measured: 9px under the green bracket, 6px above the red bar.
  The click band is now read from the two brackets themselves — the
  parent's top down to the child's bar — so it follows the drop without
  knowing the constant, and it covers the gap the drop opens up.
- Theme: a second deliberate departure from the verbatim extraction
  (documented in themes.js beside squareCorners). MindMup coloured the
  nested SUPPORTING label green to match its bracket but left the nested
  OPPOSING one at the default grey #4F4F4F; it is now red, at MindMup's
  own 9px. Simon's call. Dark mode carries it to #ff5d5d with every other
  red, and a map's own embedded theme still wins, so historical files are
  untouched.
- Tests: 25 checks in features-e2e (the band's bounds, the cursor hint,
  selection left alone, the flush unlabelled layout, the 12px drop and
  that only that subtree moves, both clearances, colour, centring,
  re-editing by clicking the rendered text, undo restoring the flush
  layout, the green nested-reason case, both brackets still selectable,
  the menu path, serialization, dark mode byte-identical, zoom); the
  layout assertions read `getCurrentLayout()` rather than DOM rects,
  because a selected claim wears a 3px border that moves its own box.
  webkit-e2e drives the whole
  click-type-⌘Z cycle in real Safari, where a capture-phase interception
  plus a floating keyboard-driven input is exactly the combination that
  has broken before. All seven suites pass.

## 2026-07-25 — MIT licensing stated properly; GCS mirror retired

- GitHub reported the repo's license as "Other", not MIT: LICENSE carried
  the mapjs attribution paragraph inside the MIT text, which put it below
  the similarity GitHub's detector needs. LICENSE is now verbatim MIT
  (Copyright (c) 2026 Simon Cullen) and `gh api repos/symonh/because`
  returns `spdx_id: MIT`.
- THIRD-PARTY-NOTICES.md collects what ships: mapjs, the MIT libraries
  esbuild compiles into the bundles (jQuery, Hammer.JS + its jQuery
  plugin, jQuery Hotkeys, Underscore, PolyBool.js,
  monotone-convex-hull-2d and its robust-*/two-* deps), and the two OFL
  1.1 fonts. The bundled set was read off the `node_modules/…` paths
  esbuild leaves in app/bundle.js, not off package.json.
- Fonts now ship their license (app/fonts/OFL.txt,
  engine-demo/fonts/OFL.txt), which OFL 1.1 requires and nothing did
  before. build.sh stamps both bundles with a `--banner:js` naming every
  bundled copyright holder, since the bundle is the copy browsers get.
  Rebuilding with the banner is otherwise byte-identical to the committed
  bundles (checked by rebuilding unchanged first); all seven suites pass.
- site/terms.html's open-source section now names the app's own MIT
  license and links the repo and the notices file.
- **GCS mirror retired.** Checked what it actually held before removing
  it: `gs://argumentbase-app` contained only app/ and samples/, no
  website config, and nothing anywhere links to it — no DNS, no redirect.
  It could not serve as an app failover either, because OAuth needs a
  real origin and storage.googleapis.com can never be one
  (docs/drive-setup.md), so Drive/OneDrive sign-in never worked there.
  The two `gcloud storage rsync` lines are gone from deploy.sh; the
  recurring "mirror step failed, needs an interactive gcloud auth login"
  problem goes with them.

## 2026-07-25 — Chrome overhaul: left rail by default, floating and classic as options

- Three chrome layouts, chosen from a View-menu radio group and stored as
  `because.layout` (an app preference like dark mode — map data untouched,
  serialization asserted byte-identical across every switch):
  - **Left-side controls** (default): a slim top bar (brand, title, text
    menus, save status) plus a 46px vertical icon rail spanning the full
    window height. The rail holds the editing tools only — New/Open/Save
    live in the File menu and on their keys — with zoom and the theme
    toggle docked at the foot.
  - **Floating controls**: no bars. An identity pill top-left (title +
    ellipsis menu button), a tool palette on the left edge, a zoom cluster
    bottom-left, a save-status chip top-right, all floating over an
    edge-to-edge canvas.
  - **Classic top controls**: the pre-overhaul layout exactly (horizontal
    menubar + 19-button toolbar), for continuity with older course
    materials.
- New icon set (`app/js/icons.js`): one 20px grid, single 1.5px stroke,
  round joins. Colour only where it means something — green support, red
  opposition, via `.ic-sup`/`.ic-opp` classes styled per chrome theme. The
  reason/objection glyphs use the map's own bracket distinction (rounded
  supports, square opposes); the floppy disk and the "1.1" text-in-a-button
  are gone. Glyph geometry was signed off from mockups; icons.js says not
  to edit path data without a visual re-review.
- menus.js refactored so one menu spec renders two ways: the existing
  WAI-ARIA horizontal menubar, or a flyout behind a single button
  (menu-button pattern: aria-haspopup/aria-expanded, cascading submenus,
  per-level Escape with focus return). The flyout serves the floating
  pill's ellipsis and the mobile Menu button. Menubar title "Argument
  Visualization" renamed "Argument".
- Mobile (max-width 719px) overrides the desktop choice: slim top bar,
  bottom toolbar with five ≥44px targets (Reason, Objection, Edit, Undo,
  Menu), the Menu button opening the flyout as a bottom sheet.
- layout.js orchestrates: body grid per mode; the movable singletons
  (#map-title, #save-status, #theme-toggle, #menubar) are relocated, not
  duplicated, so the status live region and listeners survive switches.
- Analytics: new `layout_select` event, `layout` enum only
  (docs/analytics.md).
- Tests: features-e2e gained layout + mobile sections (~70 assertions,
  including the byte-identical rule and no content in layout_select);
  a11y-e2e scans floating light/dark and mobile with axe and walks the
  flyout keyboard contract; webkit-e2e drives the layout switch, the
  flyout's popup-under-Safari-rules path, and Shift+T in floating. All
  seven suites pass (427 checks).
- Implementation by Opus subagents against a written spec; design
  decisions and visual QA (screenshots of all modes, both themes) by
  Fable. One glyph fixed in review (the moon was a bitten circle, now a
  crescent).

## 2026-07-24 — ? opens a keyboard reference that cannot drift

- `?` (the character, not Shift+/, so it follows a non-QWERTY layout) opens
  a modal listing every key, grouped: building the argument, moving around,
  editing a claim, the map as a whole, and the mouse actions. Help >
  Keyboard shortcuts opens the same dialog; both run through
  `commands.showShortcuts`, so both are counted by surface. Map-scoped like
  the other single-character keys, which is what keeps WCAG 2.1.4 satisfied
  — with focus in the menubar or toolbar, ? is free.
- `app/js/shortcut-help.js` is the single source of truth. menus.js no
  longer keeps a list of its own (its copy had already drifted: it never
  mentioned Ctrl, Shift+arrows, ⌘←/→, or Ctrl+Y). features-e2e reads
  shortcuts.js, extracts every `commands.X` it binds, and fails if any of
  the 20 is missing from the table or if the table names a command that no
  longer exists.
- Keys are stored platform-neutrally and rendered per platform: Mod is ⌘ or
  Ctrl, Alt is ⌥ or Alt, the erase key is ⌫ or "Delete or Backspace", and
  Ctrl+Y appears as a second redo on Windows only. Mac combinations are
  written Apple-style (⌘⇧Z), Windows with separators (Ctrl+Shift+Z). The
  platform is detected and can be switched in the dialog, for a teacher
  demonstrating on the other kind of machine; the choice persists in
  localStorage.
- What the engine's own keys do was measured against the running app rather
  than transcribed from mapjs's binding table, which is misleading here:
  the orientation is top-down, so moveUp/moveDown are no-ops and ⌘←/→ are
  the reorder keys; the app's own Enter/Tab handlers take shifted Enter and
  Tab too. Shift+arrows building a multi-claim set — and Delete, collapse
  and the font-size keys then applying to all of it — was undocumented
  anywhere before this.
- The dialog's Escape now routes through the module's own close(), after
  the probe caught the state going stale (Escape removed the overlay
  through initModal's own path, and the module then refused to reopen).

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
