# Google Drive integration — one manual step left

Everything scriptable is already done (project `driveshare-446802`):

- Drive API and Picker API are enabled.
- A browser API key exists, restricted to those two APIs and to the
  `app.philmaps.com` / `argumentbase.web.app` / localhost referrers. It is
  in `app/js/config.js` and is safe in public code.
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
