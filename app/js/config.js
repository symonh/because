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
