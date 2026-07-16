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
   - App name `Because`, user support email sc@simoncullen.org,
     developer contact sc@simoncullen.org. Save.
2. **Audience** — https://console.cloud.google.com/auth/audience?project=driveshare-446802
   - Choose **External**, then **Publish** the app. (In Testing mode only
     allow-listed test users can sign in; published + non-sensitive scope
     means no verification and no user cap.)
3. **Create the client** — https://console.cloud.google.com/auth/clients?project=driveshare-446802
   - Create client → type **Web application** → name `Because web`.
   - Authorized JavaScript origins (no redirect URIs needed):
     - `https://argumentbase.web.app`
     - `https://app.philmaps.com` (the custom domain, once live)
     - `http://localhost:8871`
     - `http://127.0.0.1:8871`
   - Copy the client ID (`…apps.googleusercontent.com`).
4. Paste the client ID into `clientId` in `app/js/config.js` and run
   `./deploy.sh` — or just give the ID to Claude.

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
