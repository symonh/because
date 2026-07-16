/*
 * Google Drive integration config.
 *
 * apiKey is a browser key restricted to the Drive + Picker APIs and to the
 * argumentbase.web.app / localhost referrers, so it is safe in public code.
 *
 * clientId is the OAuth 2.0 Web client from Google Cloud Console
 * (project driveshare-446802). Creating one is the single step Google
 * offers no API for — see docs/drive-setup.md. Until it is filled in,
 * the Drive menu items show setup instructions instead.
 */
export const driveConfig = {
	clientId: '',
	apiKey: 'AIzaSyDOJ9AI5vaQTePuURKa7NQTM40y00NiuK0',
	appId: '839787428721',
	scope: 'https://www.googleapis.com/auth/drive.file'
};
