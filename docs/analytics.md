# Google Analytics (GA4) integration

Everything gtag-related lives in `app/js/analytics.js`; the measurement id
lives in `app/js/config.js` (`gaConfig.measurementId`). The three static
site pages import the same module, so one id covers the whole property.

## Why the old philmaps id cannot be used

`UA-106489762-1` is a **Universal Analytics** property. Google shut UA
down on July 1, 2023 (data processing stopped; the historical data was
later deleted). A UA id wired into gtag today collects nothing, silently.
GA4 is the replacement and its web streams use `G-…` measurement ids.

## One-time setup (Simon, ~5 minutes)

1. Sign in at <https://analytics.google.com> with the account that owned
   the philmaps UA property. Google auto-created GA4 properties for most
   UA properties in 2023, so a "philmaps.com - GA4" property may already
   exist (property picker, top left).
2. In that property (or a fresh one): **Admin → Data streams → Add
   stream → Web**, URL `https://app.philmaps.com`, name it `Because`.
   A dedicated stream keeps editor traffic separable from philmaps.com.
3. Copy the stream's **Measurement ID** (`G-XXXXXXXXXX`) into
   `gaConfig.measurementId` in `app/js/config.js`, run the tests, deploy.
4. Recommended property settings:
   - **Admin → Data settings → Data retention**: 14 months (the maximum
     on the free tier; the default is 2 months).
   - **Admin → Data settings → Data collection**: leave Google signals
     OFF (the app also disables it client-side).
5. Register the custom dimensions below (**Admin → Custom definitions →
   Create custom dimension**), otherwise event parameters don't appear
   in standard reports. All are event-scoped except `dark_mode`
   (user-scoped).

   | Dimension name | Event parameter | Scope |
   |---|---|---|
   | Command | `command_name` | Event |
   | Method | `method` | Event |
   | Map open method | (reuse `method`) | Event |
   | Node bucket | `node_bucket` | Event |
   | Map theme | `map_theme` | Event |
   | Save destination | `destination` | Event |
   | Save mode | `mode` | Event |
   | Connector action | `action` | Event |
   | Theme | `theme` | Event |
   | Help panel | `panel` | Event |
   | Intro trigger | `trigger` | Event |
   | Dark mode | `dark_mode` | User |

   Numeric parameters worth registering as **custom metrics**:
   `node_count` (map size) and `changes` (edits per batch).

## Event vocabulary

| Event | Parameters | Fired when |
|---|---|---|
| `app_open` | — | the editor boots (site pages send only `page_view`) |
| `map_open` | `method` (`new`, `file_picker`, `drag_drop`, `drive`, `url`, `autosave_restore`, `unknown`), `node_count`, `node_bucket`, `map_theme` | any map replaces the current one |
| `map_save` | `destination` (`file`, `download`, `drive`), `mode` (`save`, `save_as`, `save_copy`, `guard`, `auto`) | a save completes (`guard` = via the unsaved-changes dialog, `auto` = auto-save wrote the map's own file) |
| `auto_save_toggle` | `enabled` (`on`/`off`) | File > Auto-save toggled |
| `auto_save_error` | `description` (truncated) | an auto-save attempt failed; auto-save pauses until the next successful save |
| `map_print` | — | print / save-as-PDF starts |
| `command` | `command_name` (the `commands.js` name, e.g. `addReason`), `method` (`menu`, `toolbar`, `shortcut`, `style_popover`) | any command runs, tagged by UI surface |
| `edit_batch` | `changes` | batched count of model changes, flushed when the tab hides and every 2 minutes — measures editing intensity without per-keystroke events |
| `connector_action` | `action` (`stronger`, `weaker`, `label_edit`, `label_set`, `label_cleared`), `has_label` | connector popover and label editing |
| `node_style` | `action` (`popover_open`, `background_swatch`, `background_custom`, `background_clear`), `swatch`, `method` | right-click style popover |
| `theme_select` | `theme` (`simple`, `high_impact`) | View-menu theme switch |
| `dark_mode_toggle` | `enabled` (`on`/`off`) | any dark-mode toggle (also kept as the `dark_mode` user property) |
| `intro_shown` / `intro_dismissed` | `trigger` (`first_visit`, `menu`); `dont_show_again` (`yes`/`no`) | welcome modal |
| `help_open` | `panel` (`shortcuts`, `about`, `drive_setup`) | Help panels |
| `drive_error` | `description` (truncated) | non-benign Drive failure shown to the user |
| `exception` | `description`, `fatal: false` | uncaught error / unhandled rejection; deduplicated, max 10 per session |

Every `config` call also carries `app_version` — deploy.sh stamps the git
short hash into the deployed copy of analytics.js (the repo copy says
`dev`), so regressions can be tied to the exact deploy in GA.

## Privacy rules (enforced at call sites, disclosed in site/privacy.html)

- Events carry feature names, fixed enum values, and counts **only**.
  Map content, claim titles, file names, Drive ids, and anything the user
  typed never leave the browser. `track()` truncates strings defensively
  and masks any unbroken 25+ character token (Drive file ids are 25–44
  chars), so even a raw error message can't leak an id — but the rule is:
  don't pass user text in the first place.
- Google signals and ad-personalization are disabled in the gtag config.
- Global Privacy Control disables analytics entirely.
- The welcome modal and the privacy policy state all of this; if the
  vocabulary above gains anything user-identifying (don't), those pages
  must change first.

## Development and testing

- Analytics never sends from `localhost`/loopback, so dev servers and the
  e2e suites stay out of the production property. Every `track()` still
  lands in a local ring buffer: `window.__because.analytics.events()`.
- To test live sending (GA DebugView) from localhost:
  `localStorage.setItem('because.ga.debug', '1')` and reload — this both
  enables sending and sets `debug_mode`, so hits appear in
  **Admin → DebugView** within seconds.
- `test/features-e2e.js` asserts the event pipeline (buffer contents,
  surface tagging, edit batching) and that no map text leaks into any
  event payload.
