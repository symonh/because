# Microsoft OneDrive integration — one manual step left

Everything in the app is written and tested with Microsoft's side
stubbed (`app/js/onedrive.js`, `test/onedrive-e2e.js`); the OneDrive
menu items show setup instructions until a client id lands in
`app/js/config.js`. Microsoft offers no way to create an app
registration without an interactive login, so this part is a portal
task (~3 minutes).

## Register the Entra app (Simon)

1. Sign in at <https://entra.microsoft.com> (or portal.azure.com).
   A personal Microsoft account or the CMU account both work, provided
   the tenant allows user app registrations; a personal account gets a
   free default tenant.
2. **Identity → Applications → App registrations → New registration**
   - Name: `Because`
   - Supported account types: **Accounts in any organizational
     directory and personal Microsoft accounts** (instructors may be
     on either).
   - Redirect URI: platform **Single-page application (SPA)**, value
     `https://app.philmaps.com/app/auth-popup.html`
3. After creation, under **Authentication → Single-page application →
   Add URI**, add the local test URIs:
   - `http://localhost:8871/app/auth-popup.html`
   - `http://127.0.0.1:8871/app/auth-popup.html`

   The SPA platform is what enables CORS on the token endpoint; the
   flow breaks if these are registered under the "Web" platform.
4. **API permissions**: Microsoft Graph → Delegated →
   `Files.ReadWrite`. (The default `User.Read` can stay; the app never
   calls it.) openid, profile and offline_access are consented by the
   user at sign-in — nothing here needs admin consent.
5. Copy the **Application (client) ID** from Overview into
   `onedriveConfig.clientId` in `app/js/config.js`, run the test
   suites, deploy — or just give the ID to Claude.

## Implementation notes

- Auth is authorization-code + PKCE in a popup; `app/auth-popup.html`
  posts the code back to the opener. No MSAL: Microsoft's CDN stopped
  publishing it at v2, and one scope + one flow does not justify
  vendoring a 200 KB library. The refresh token persists in
  localStorage (`because.onedrive.refresh`) so return visits skip the
  popup. Microsoft limits refresh tokens issued to SPAs to roughly a
  day, after which the popup reappears once (and auto-closes while the
  Microsoft session is still alive).
- Scope is `Files.ReadWrite` only. Microsoft has no per-file picker
  grant equivalent to Google's `drive.file` for third-party web apps,
  so the in-app picker (a panel over Graph folder listings) scopes the
  UI, not the permission.
- Reads use `@microsoft.graph.downloadUrl`: the `/content` endpoint
  answers with a 302, which CORS forbids for browser requests that
  carry an Authorization header.
- Writes: `PUT /me/drive/items/{id}/content` in place; new files via
  `PUT /me/drive/root:/{name}:/content` with
  `@microsoft.graph.conflictBehavior=rename`.
- The granting account persists (`because.onedrive.account`) and pins
  later sign-ins via `login_hint`; **File → Switch Microsoft
  account…** clears it — the same pattern as Google Drive.
- Microsoft's embedded file picker was rejected deliberately: it needs
  cross-site cookies and resource-specific token brokering, which
  break in Safari (the same reason the app opens Google's sharing on
  drive.google.com instead of embedding it).

## What instructors get once the ID is in

- **File → Open from OneDrive…** — Microsoft sign-in (first time),
  then an in-app folder browser; picking a `.mup` opens it.
- **Save** — a map opened from OneDrive saves back to the same file;
  File > Auto-save targets it too.
- **File → Save a copy in OneDrive…** — writes a new `.mup` into the
  OneDrive root (auto-renamed on name clashes).
- **File → Share from OneDrive…** — opens the file's own OneDrive page
  in a new tab; the native Share button lives there.
