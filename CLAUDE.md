# Because — project instructions

Read STATUS.md first for current state; docs/drive-setup.md for the Drive
OAuth setup.

## Hard rules

- `samples-local/` and `refs-local/` are gitignored and must NEVER be
  committed or deployed: they hold real course maps, official solution
  maps, and reference screenshots. This repo will be open-sourced. Deploy
  only `app/` and the synthetic `samples/` (deploy.sh already stages
  exactly that).
- Simon uses Safari. Verify anything involving file inputs, popups,
  keyboard, or gestures in WebKit (Playwright) as well as Chrome — three
  Safari-specific bugs have already come from Chrome-only testing.
- Rendering fidelity is anchored to the theme JSON embedded in .mup files
  saved by MindMup, not to screenshots (Simon's Mac screenshots are
  display-P3 color-shifted). Never change the authentic theme values in
  app/js/themes.js without a primary source.
- Dark mode and any future view preference must never alter map data:
  a .mup must serialize byte-identical in any view state.

## Build & deploy

- The app (`app/`) needs no build; the engine bundle is committed.
  Rebuild only after touching `engine/vendor/mapjs/src`: run
  `engine/build.sh` (underscore must stay aliased to its UMD build —
  see the script). Record vendor patches in
  `engine/vendor/mapjs/LOCAL-PATCHES.diff`.
- Deploy with `./deploy.sh` (Firebase Hosting site `argumentbase` — a
  legacy id from the old app name). Public URL:
  https://app.philmaps.com.
- The landing page's argument-map figures ARE built: they are pre-rendered
  from `figures/maps/*.json` and committed. Change a map and rerun
  `node figures/build.mjs`, then commit `site/index.html` and
  `site/maps/*.mup` with it; never hand-edit between the
  `<!-- argmap:id -->` markers. `deploy.sh` runs `--check` and aborts on
  drift. Change the hero and also rerun `cd test && node og-shot.js` to
  redraw `site/og.png` — the social card renders the same map. See
  docs/figures.md.
- Tests: `cd test && npm test`. It serves the repo root and runs all
  nine suites in order: the Chrome suites (`app-e2e.js`,
  `robustness-e2e.js`, `click-select-e2e.js`, `drive-e2e.js`,
  `onedrive-e2e.js`, `features-e2e.js`), then `webkit-e2e.js`
  (Playwright WebKit — the Safari rule), `a11y-e2e.js` (WCAG 2.2 AA
  gate; docs/accessibility.md) and `site-e2e.js` (the landing-page
  figures, both engines). `npm test -- app-e2e.js` runs only the suites
  named. Needs system Chrome (or `CHROME_PATH`) and Playwright WebKit
  (`npx playwright-core install webkit`). All must pass before
  deploying.

## Engine background

mapjs (vendored, MIT) is only the rendering/model layer: MindMup kept
undo bindings, click-to-select, and Drive I/O in its closed app layer,
so this repo implements those in `app/js/`. When something "should work
but doesn't", check whether mapjs merely dispatches an event nobody
consumes (that was the story for both Cmd+Z and click-to-select).
