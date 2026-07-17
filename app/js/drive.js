/*global window, document*/
/*
 * Google Drive open/save. Built for the instructor transition path:
 * .mup files already sitting in Drive open through the Google Picker, and
 * a map opened from Drive saves back to the same file with plain Save.
 *
 * Uses the drive.file scope only — the app can touch just the files the
 * user picks or creates with it, which keeps the OAuth consent screen in
 * the non-sensitive tier (no Google security review needed). Access is
 * granted per-file by the Picker; that is why opening MUST go through the
 * Picker rather than a file list of our own.
 *
 * Scripts (GIS + Picker) are loaded lazily on first use, so the app works
 * fully offline/local until a Drive menu item is clicked.
 */
import { driveConfig } from './config.js';
import { track, noteMapSource } from './analytics.js';

const GSI_SRC = 'https://accounts.google.com/gsi/client',
	GAPI_SRC = 'https://apis.google.com/js/api.js',
	MUP_MIME = 'application/vnd.mindmup',
	// what instructors' existing .mup files look like to Drive: MindMup
	// saved them with its own mime type; manual uploads get octet-stream
	OPENABLE_MIMES = [MUP_MIME, 'application/json', 'application/octet-stream', 'text/plain'].join(',');

export function makeDrive(engine, io, status) {
	let accessToken = null,
		tokenExpiresAt = 0,
		tokenClient = null,
		pickerReady = false,
		accountHint = null, // email of the account that granted access
		currentDriveFile = null; // {id, name, canEdit} while the open map lives in Drive

	const scriptPromises = {},
		loadScript = function (src) {
			if (!scriptPromises[src]) {
				scriptPromises[src] = new Promise(function (resolve, reject) {
					const s = document.createElement('script');
					s.src = src;
					s.onload = resolve;
					s.onerror = () => reject(new Error('failed to load ' + src));
					document.head.appendChild(s);
				});
			}
			return scriptPromises[src];
		},
		ensureToken = async function () {
			if (accessToken && Date.now() < tokenExpiresAt - 60000) {
				return accessToken;
			}
			await loadScript(GSI_SRC);
			if (!tokenClient) {
				tokenClient = window.google.accounts.oauth2.initTokenClient({
					client_id: driveConfig.clientId,
					scope: driveConfig.scope,
					callback: () => {} // replaced per request below
				});
			}
			return new Promise(function (resolve, reject) {
				tokenClient.callback = function (resp) {
					if (resp.error) {
						reject(new Error(resp.error));
						return;
					}
					accessToken = resp.access_token;
					tokenExpiresAt = Date.now() + (Number(resp.expires_in) || 3600) * 1000;
					captureAccount(accessToken);
					resolve(accessToken);
				};
				// GIS reports popup failures here (e.g. blocked when the
				// request runs outside a user gesture — an expired token
				// during auto-save); without it the promise never settles
				tokenClient.error_callback = function (err) {
					const type = (err && err.type) || 'unknown';
					reject(new Error(type === 'popup_failed_to_open' ?
						'Google sign-in popup was blocked — use File > Save to sign in again.' : type));
				};
				// after the first grant Google re-issues silently; the popup
				// only appears when consent is actually needed. The hint pins
				// renewals to the account that granted access — without it a
				// silent renewal in a multi-account browser can come back for
				// a DIFFERENT account, and every file call then 404s.
				const overrides = { prompt: '' };
				if (accountHint) { overrides.hint = accountHint; }
				tokenClient.requestAccessToken(overrides);
			});
		},
		// fire-and-forget whoami for the hint above; never blocks a save
		captureAccount = function (token) {
			window.fetch('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)', {
				headers: { Authorization: 'Bearer ' + token }
			}).then(r => (r.ok ? r.json() : null))
				.then(function (info) {
					const email = info && info.user && info.user.emailAddress;
					if (email) { accountHint = email; }
				})
				.catch(() => {});
		},
		ensurePicker = async function () {
			if (pickerReady) { return; }
			await loadScript(GAPI_SRC);
			await new Promise(resolve => window.gapi.load('picker', resolve));
			pickerReady = true;
		},
		driveFetch = async function (url, options) {
			const token = await ensureToken(),
				resp = await window.fetch(url, Object.assign({}, options, {
					headers: Object.assign(
						{ Authorization: 'Bearer ' + token },
						(options && options.headers) || {})
				}));
			if (resp.status === 401) {
				// token revoked mid-session — force a fresh grant once
				accessToken = null;
				throw new Error('Google Drive sign-in expired. Please try again.');
			}
			if (!resp.ok) {
				throw new Error('Google Drive error ' + resp.status + ': ' + (await resp.text()).slice(0, 300));
			}
			return resp;
		},
		// metadata probe: is the file trashed / writable / visible at all?
		// Drive masks most access problems as plain 404, so this is how a
		// failed write gets an actionable explanation
		probeFile = async function (id) {
			const resp = await driveFetch('https://www.googleapis.com/drive/v3/files/' +
				encodeURIComponent(id) + '?fields=trashed,capabilities/canEdit&supportsAllDrives=true');
			return resp.json();
		},
		showError = function (e) {
			// popup dismissed / permission declined are normal cancellations
			const benign = /popup_closed|access_denied|user_cancel/i.test(String(e && e.message));
			if (!benign) {
				track('drive_error', { description: String((e && e.message) || e) });
				window.alert(String((e && e.message) || e));
			}
		},
		pickFile = async function () {
			await ensurePicker();
			const token = await ensureToken();
			return new Promise(function (resolve) {
				const google = window.google,
					view = new google.picker.DocsView(google.picker.ViewId.DOCS)
						.setIncludeFolders(true)
						.setMimeTypes(OPENABLE_MIMES);
				if (view.setEnableDrives) { view.setEnableDrives(true); } // shared drives
				let builder = new google.picker.PickerBuilder()
					.setDeveloperKey(driveConfig.apiKey)
					.setAppId(driveConfig.appId)
					.setOAuthToken(token)
					.setTitle('Open an argument map (.mup)')
					.addView(view)
					.setCallback(function (data) {
						if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
							resolve(data[google.picker.Response.DOCUMENTS][0]);
						} else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
							resolve(null);
						}
					});
				if (google.picker.Feature && google.picker.Feature.SUPPORT_DRIVES) {
					builder = builder.enableFeature(google.picker.Feature.SUPPORT_DRIVES);
				}
				builder.build().setVisible(true);
			});
		},
		saveToDrive = async function (asCopy, opts) {
			const auto = !!(opts && opts.auto),
				text = engine.serialize();
			let name = io.fileName();
			if (asCopy || !currentDriveFile) {
				// an auto-save must never open a prompt; it only ever runs
				// while a Drive file is current, so this is a safety net
				if (auto) { throw new Error('auto-save has no Drive file to write to'); }
				const suggested = (name === 'untitled.mup' && engine.mapModel.getIdea()) ?
					rootTitleName() : name;
				name = window.prompt('Save in Google Drive as:', suggested);
				if (!name) { return false; }
				if (!/\.mup$/i.test(name)) { name += '.mup'; }
			}
			if (currentDriveFile && !asCopy) {
				await driveFetch('https://www.googleapis.com/upload/drive/v3/files/' +
					encodeURIComponent(currentDriveFile.id) + '?uploadType=media&supportsAllDrives=true', {
					method: 'PATCH',
					headers: { 'Content-Type': MUP_MIME },
					body: text
				});
				track('map_save', { destination: 'drive', mode: auto ? 'auto' : 'save' });
				io.markSaved(currentDriveFile.name);
				return true;
			}
			const boundary = 'because-' + String(Math.random()).slice(2),
				body = '--' + boundary + '\r\n' +
					'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
					JSON.stringify({ name: name, mimeType: MUP_MIME }) + '\r\n' +
					'--' + boundary + '\r\n' +
					'Content-Type: ' + MUP_MIME + '\r\n\r\n' +
					text + '\r\n' +
					'--' + boundary + '--',
				resp = await driveFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name&supportsAllDrives=true', {
					method: 'POST',
					headers: { 'Content-Type': 'multipart/related; boundary=' + boundary },
					body: body
				}),
				meta = await resp.json();
			track('map_save', { destination: 'drive', mode: asCopy ? 'save_copy' : 'save_as' });
			currentDriveFile = { id: meta.id, name: meta.name };
			io.setSaveOverride(opts => drive.save(false, opts));
			io.markSaved(meta.name);
			return true;
		},
		// Drive masked a failed write as 404 — probe the file so the message
		// says what is actually wrong, then offer saving as a new file
		offerCopyAfter404 = async function (e) {
			track('drive_error', { description: String((e && e.message) || e) });
			let why = 'Google Drive reported the file missing.';
			try {
				const meta = await probeFile(currentDriveFile.id);
				if (meta && meta.trashed) {
					why = 'The file is in the Drive trash.';
				} else if (meta && meta.capabilities && meta.capabilities.canEdit === false) {
					why = 'You have view-only access to this file.';
				}
			} catch (probeErr) {
				why = 'Google Drive can no longer see this file' +
					(accountHint ? ' from ' + accountHint : '') +
					' — it may have been deleted, or it may belong to a different Google account.';
			}
			if (window.confirm('Couldn’t save to “' + currentDriveFile.name + '”. ' + why +
					'\n\nSave your current map as a NEW Drive file instead?')) {
				return drive.save(true);
			}
			return false;
		},
		rootTitleName = function () {
			const idea = engine.mapModel.getIdea(),
				roots = idea && idea.ideas && Object.values(idea.ideas),
				title = (roots && roots[0] && roots[0].title) || 'My argument';
			return title.slice(0, 60).replace(/[\\/:*?"<>|]/g, '') + '.mup';
		};

	// opening anything that is not this Drive file unbinds Save from Drive
	engine.on('mapLoaded', function () {
		currentDriveFile = null;
		io.setSaveOverride(null);
	});

	// preload the Google scripts so the consent popup opens inside the
	// user's click (a lazy script load would outlive the gesture and get
	// popup-blocked, most reliably in Safari)
	if (driveConfig.clientId) {
		loadScript(GSI_SRC).catch(() => {});
		loadScript(GAPI_SRC).then(() => ensurePicker()).catch(() => {});
	}

	const drive = {
		isConfigured: () => !!driveConfig.clientId,
		currentFile: () => currentDriveFile,
		open() {
			io.guardUnsaved(async function () {
				try {
					const doc = await pickFile();
					if (!doc) { return; }
					const resp = await driveFetch('https://www.googleapis.com/drive/v3/files/' +
							encodeURIComponent(doc.id) + '?alt=media&supportsAllDrives=true'),
						text = await resp.text();
					noteMapSource('drive');
					io.loadJson(JSON.parse(text), doc.name); // clears currentDriveFile via mapLoaded
					currentDriveFile = { id: doc.id, name: doc.name };
					io.setSaveOverride(opts => drive.save(false, opts));
					// warn about a view-only file NOW, not when the first
					// save fails (Drive would mask that failure as a 404)
					try {
						const meta = await probeFile(doc.id);
						if (meta && meta.capabilities && meta.capabilities.canEdit === false) {
							currentDriveFile.canEdit = false;
							window.alert('You have view-only access to “' + doc.name +
								'” in Google Drive. You can edit the map here, but File > Save ' +
								'will save it as a new Drive file (a copy).');
						}
					} catch (ignore) { /* the probe is advisory */ }
				} catch (e) {
					showError(e);
				}
			});
		},
		async save(asCopy, opts) {
			const auto = !!(opts && opts.auto);
			// a view-only file can never be written in place: manual Save
			// becomes save-a-copy; auto-save pauses via its failure path
			if (!asCopy && currentDriveFile && currentDriveFile.canEdit === false) {
				if (auto) { throw new Error('view-only Drive file — File > Save saves a copy'); }
				return drive.save(true, opts);
			}
			try {
				return await saveToDrive(asCopy, opts);
			} catch (e) {
				if (auto) { throw e; } // auto-save handles it silently
				if (!asCopy && currentDriveFile && /error 404/.test(String(e && e.message))) {
					return offerCopyAfter404(e);
				}
				showError(e);
				return false;
			}
		}
	};
	return drive;
}
