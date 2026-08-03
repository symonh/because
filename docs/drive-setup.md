# Google Drive integration — one manual step left

Everything scriptable is already done (project `driveshare-446802`):

- Drive API and Picker API are enabled.
- A browser API key exists, restricted to those two APIs and to the
  `app.philmaps.com` / `argumentbase.web.app` / localhost referrers **plus
  `https://docs.google.com/*`** — see "The referrer list must include
  docs.google.com" below, which is not optional. It is in
  `app/js/config.js` and is safe in public code.
- The app is hosted at https://app.philmaps.com (Firebase Hosting; the
  underlying site keeps the legacy id `argumentbase`, so
  argumentbase.web.app serves the same content) — a real origin, which
  OAuth requires; `storage.googleapis.com` can never be one.
- The client code (`app/js/drive.js`) is written, wired into the File
  menu, and tested with a stubbed token. It uses the `drive.file` scope
  only: the app can read and write just the files the user picks in the
  Google Picker or creates through the app. That scope is in Google's
  non-sensitive tier, so publishing the consent screen does not trigger a
  security review.

Google offers no API for creating OAuth clients, so this part is a
Console task (about two minutes, signed in as sc@simoncullen.org):

1. **Branding** — https://console.cloud.google.com/auth/branding?project=driveshare-446802

   The project carries leftover branding from the old DriveShare app
   (simoncullen.org links, which no longer resolve). Replace with:
   - App name `Because`; user support email sc@simoncullen.org.
   - Logo: leave empty — uploading one triggers Google's
     brand-verification review.
   - Application home page `https://app.philmaps.com`; privacy policy
     `https://app.philmaps.com/privacy`; terms of service
     `https://app.philmaps.com/terms` (both served from site/ in this
     repo).
   - Authorized domains: `philmaps.com`. Before deleting
     `simoncullen.org`, check the Clients tab for any old DriveShare
     client that might still use it; adding philmaps.com alongside is
     also fine.
   - Developer contact sc@simoncullen.org (an email, so simoncullen.org
     is correct here). Save.
2. **Audience** — https://console.cloud.google.com/auth/audience?project=driveshare-446802
   - Choose **External**, then **Publish** the app. (In Testing mode only
     allow-listed test users can sign in; published + non-sensitive scope
     means no verification and no user cap.)
3. **Create the client** — https://console.cloud.google.com/auth/clients?project=driveshare-446802
   - Create client → type **Web application** → name `Because web`.
   - Authorized JavaScript origins (no redirect URIs needed):
     - `https://app.philmaps.com`
     - `https://argumentbase.web.app` (if the console objects that the
       domain isn't authorized, either add `argumentbase.web.app` as an
       authorized domain on Branding — web.app subdomains count as their
       own registrable domains — or drop this origin; the custom domain
       is the one that matters)
     - `http://localhost:8871`
     - `http://127.0.0.1:8871`
   - Copy the client ID (`…apps.googleusercontent.com`).
4. Paste the client ID into `clientId` in `app/js/config.js` and run
   `./deploy.sh` — or just give the ID to Claude.

## Branding verification retry (2026-07-16)

Google's first branding verification failed with three findings; all
three traced to `https://app.philmaps.com/` answering with a **302
redirect to /app/**, whose HTML is a JavaScript shell with no crawlable
text — Google's checker reads that as a gated/empty page:

- "Your home page is behind a login page" — it never was; the checker
  saw the redirect + contentless HTML.
- "Your home page does not explain the purpose of your app."
- App-name mismatch — no visible "Because" on the crawled page.

Fixed in the repo: the `/` → `/app/` redirect is gone from
`firebase.json`, and `site/index.html` now serves a static landing page
at `https://app.philmaps.com/` that names **Because**, explains argument
visualization (language adapted from philmaps.com), and links to the
editor (`/app/`), `/privacy`, and `/terms`. The app itself also shows a
first-visit welcome modal (Help > Welcome to Because) stating name and
purpose.

To retry: deploy, confirm `https://app.philmaps.com/` returns the
landing page with HTTP 200 (`curl -sI https://app.philmaps.com/`), keep
the consent-screen home page set to `https://app.philmaps.com`, and
resubmit branding verification from the Branding page.

### Second attempt (still 2026-07-16)

Two findings remained: "home page does not explain the purpose" and
"app name does not match". Google's checker reads exactly the URL in
the Branding page's **Application home page** field — nothing else. The
decisive check is therefore that the field says
`https://app.philmaps.com` verbatim. It must NOT say
`https://philmaps.com`: that URL 301-redirects off-domain to
`https://maps.simoncullen.org`, a Google Sites page whose title and
visible name are "philmaps.com" — a page that reproduces both findings
exactly. (Editing the philmaps.com site cannot fix this; the field has
to point at the landing page.)

Hardening shipped for the resubmission, since the automated checker is
known to miss names that appear only in prose
(<https://discuss.google.dev/t/-/379281> among others): the landing
page now declares the name "Because" machine-readably (canonical URL,
`application-name`, `og:site_name` / `og:title`, and a schema.org
WebApplication JSON-LD block), and `site/robots.txt` explicitly allows
all crawling. Search Console ownership is already in place —
philmaps.com carries a `google-site-verification` DNS TXT record, which
covers app.philmaps.com too.

Then resubmit from
<https://console.cloud.google.com/auth/branding?project=driveshare-446802>
and expect the automated verdict within a few days. If it fails a third
time with the same two findings while the field is verbatim
`https://app.philmaps.com`, reply to the verification email and ask for
manual review — at that point the page satisfies every published
requirement and the loop matches the known checker false-negative
threads.

## The referrer list must include docs.google.com (2026-08-03)

The Picker started failing with a full-dialog **"There was an error! The
API developer key is invalid."** without anything in this repo changing.
The cause is where Google checks the key: the Picker validates
`setDeveloperKey` from inside its own `https://docs.google.com/picker`
frame, so the referrer it presents is docs.google.com — not the
embedding page. A key allowed only on our own origins is therefore
rejected, and the app's `origin=` / `hostId=` parameters have no bearing
on it.

Bisected against the live app by swapping throwaway keys (all other
inputs held constant — same OAuth token, same `appId`, bare `DocsView`):

| Allowed referrers | Picker |
| --- | --- |
| `app.philmaps.com/*` + Drive/Picker API restrictions (what shipped) | rejected |
| `app.philmaps.com/*` alone | rejected |
| `app.philmaps.com` (bare origin, no `/*`) | rejected |
| `app.philmaps.com/*` **+ `docs.google.com/*`** | works |
| `docs.google.com/*` alone | works |
| no referrer restriction, API restrictions only | works |
| no restrictions at all | works |

So `https://docs.google.com/*` is both necessary and sufficient; our own
origins are kept in the list because they cost nothing and will start
mattering again if Google reverts to checking the embedding page.

Two things follow. First, the referrer restriction no longer pins this
key to this site — any page under docs.google.com satisfies it. The
protections that actually carry weight are the API restriction (Drive +
Picker only) and the fact that an API key opens no files: `drive.js`
uses it for nothing but `setDeveloperKey`, and every read and write goes
out under the user's own OAuth `drive.file` token. Second, the failure is
invisible to the test suite, because `drive-e2e.js` stubs the token and
never reaches Google's servers — the Picker is not automatable without a
real Google sign-in, so this specific breakage can only be caught by
opening the live app. Check it by hand after any change to the key.

To inspect or repair the key:

```
gcloud services api-keys list --project=driveshare-446802 --format=json
gcloud services api-keys update \
  projects/839787428721/locations/global/keys/68f94232-78cb-4117-bf16-0ee15ff23b6e \
  --allowed-referrers="https://app.philmaps.com/*,https://argumentbase.web.app/*,http://localhost:8871/*,http://127.0.0.1:8871/*,https://docs.google.com/*"
```

Key edits take roughly a minute to propagate; re-test before concluding
a change did nothing.

## The Picker's tabs (2026-08-03)

Each `addView` call is one tab, in the order added, and the Picker opens
on the first. `DocsView.setEnableDrives(true)` does not widen a view to
include shared drives: per Google's reference, "if true, **only** shared
drives are included in the view", and it overrides `setParent` /
`setFileIds` on the same view (with `setOwnedByMe(true)` it returns
nothing at all). Setting it on a lone view is why Open from Drive used
to open on a grid of shared drives.

`pickFile` therefore builds two views — My Drive (`setParent('root')`)
first, shared drives second — both filtered to `OPENABLE_MIMES` with
folders shown, and leaves `Feature.SUPPORT_DRIVES` on the builder so a
file picked from a shared drive opens. `drive-e2e` asserts that order.
The tab *labels* come from Google and no test can see them, so check
them by hand after touching the views.

## What instructors get once the ID is in

- **File → Open from Google Drive…** — Google sign-in (first time only),
  then the Picker showing their Drive; they select their existing `.mup`
  file and it opens. Picking a file is also what grants the app access to
  it, so old MindMup maps need no migration step at all.
- **Save** — a map opened from Drive saves back to the same Drive file;
  the unsaved-changes prompts treat Drive files the same as local ones.
- **File → Save a copy in Drive…** — writes a new `.mup` into their My
  Drive (named after the conclusion by default).
- Nothing changes for local use: Open/Save on disk works without any
  Google account.
