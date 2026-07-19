/*
 * Google Drive integration config.
 *
 * apiKey is a browser key restricted to the Drive + Picker APIs and to
 * the app.philmaps.com / argumentbase.web.app / localhost referrers, so
 * it is safe in public code. clientId is the "Because web" OAuth 2.0 Web
 * client (Google Auth Platform, project driveshare-446802) — a public
 * identifier by design; the client secret is NOT used anywhere (the GIS
 * token flow is purely client-side).
 */
export const driveConfig = {
	clientId: '839787428721-7904qkcuoujuf1ibqp8qva68vbtocmh3.apps.googleusercontent.com',
	apiKey: 'AIzaSyDOJ9AI5vaQTePuURKa7NQTM40y00NiuK0',
	appId: '839787428721',
	scope: 'https://www.googleapis.com/auth/drive.file'
};

/*
 * Microsoft OneDrive integration config.
 *
 * clientId is the Application (client) ID of a Microsoft Entra app
 * registration with a Single-page application platform — a public
 * identifier by design; no client secret exists anywhere (the app uses
 * the authorization-code + PKCE flow). An empty clientId leaves the
 * OneDrive menu items pointing at setup instructions. Registration
 * steps: docs/onedrive-setup.md.
 */
export const onedriveConfig = {
	clientId: ''
};

/*
 * Google Analytics 4. An empty measurementId disables analytics entirely
 * (the app works identically). The philmaps UA property (UA-106489762-1)
 * is Universal Analytics, which Google shut down in July 2023, so it
 * CANNOT be used here — a GA4 web stream's "G-" id is required. Setup
 * steps and the event vocabulary are in docs/analytics.md.
 */
export const gaConfig = {
	// "Because" web stream (stream id 15271314841) on app.philmaps.com
	measurementId: 'G-HZZYZYH512'
};
