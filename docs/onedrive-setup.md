# Microsoft OneDrive integration — one manual step left

Everything in the app is written and tested with Microsoft's side
stubbed (`app/js/onedrive.js`, `test/onedrive-e2e.js`); the OneDrive
menu items show setup instructions until a client id lands in
`app/js/config.js`. Microsoft offers no way to create an app
registration without an interactive login, so this part is a portal
task (~3 minutes).

## Register the Entra app (Simon)

App registrations now require the account to be inside a directory
(tenant): Microsoft deprecated directory-less personal-account
registrations in 2025, so entra.microsoft.com shows "The ability to
create applications outside of a directory has been deprecated" until
one exists. Signing up for a free Azure account fixes that by creating
a "Default Directory" (done 2026-07-19 with simon@discursively.org →
`simondiscursively.onmicrosoft.com`). App registrations themselves are
free; no Azure resources (App Service etc.) are needed.

1. Sign in at <https://portal.azure.com> and open **Microsoft Entra
   ID** from the left menu (NOT "App Services" — that is unrelated web
   hosting).
2. **Manage → App registrations → New registration**
   - Name: `Because`
   - Supported account types: **Accounts in any organizational
     directory (Any Microsoft Entra ID tenant - Multitenant) and
     personal Microsoft accounts (e.g. Skype, Xbox)** — the third
     option; instructors may be on either kind of account.
   - Redirect URI: platform **Single-page application (SPA)**, value
     `https://app.philmaps.com/app/auth-popup.html`

   The SPA platform is what enables CORS on the token endpoint; the
   flow breaks if the URI is registered under the "Web" platform.
3. Copy the **Application (client) ID** from Overview into
   `onedriveConfig.clientId` in `app/js/config.js`, run the test
   suites, deploy — or just give the ID to Claude.

Optional, only for live end-to-end testing against real OneDrive from
a dev server (the e2e suites stub Microsoft and don't need it): under
**Authentication → Single-page application → Add URI** also add
`http://localhost:8871/app/auth-popup.html` and
`http://127.0.0.1:8871/app/auth-popup.html`.

No API-permission configuration is required: the app requests
`Files.ReadWrite`, `openid`, `profile` and `offline_access` at sign-in
and the user consents there (dynamic consent); none of these need
admin consent. The Azure CLI path (`az ad app create` + a Graph PATCH
for the SPA redirect URIs) works too if a browser is unavailable.

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
