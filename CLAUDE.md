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
  legacy id from the old app name — plus a GCS mirror). Public URL:
  https://app.philmaps.com.
- Tests: serve the repo root on port 8871, then run `node app-e2e.js`,
  `node click-select-e2e.js`, `node drive-e2e.js`, `node onedrive-e2e.js`,
  `node features-e2e.js`, `node webkit-e2e.js` (Playwright WebKit — the
  Safari rule), and `node a11y-e2e.js` (WCAG 2.2 AA gate;
  docs/accessibility.md) from `test/`. All must pass before deploying.

## Engine background

mapjs (vendored, MIT) is only the rendering/model layer: MindMup kept
undo bindings, click-to-select, and Drive I/O in its closed app layer,
so this repo implements those in `app/js/`. When something "should work
but doesn't", check whether mapjs merely dispatches an event nobody
consumes (that was the story for both Cmd+Z and click-to-select).
