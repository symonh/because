/*global window, document, TextEncoder*/
/*
 * Microsoft OneDrive open/save via the Microsoft Graph API, mirroring
 * drive.js: a map opened from OneDrive saves back to the same file with
 * plain Save, and the save override makes auto-save target it too.
 *
 * Auth is a hand-rolled OAuth2 authorization-code + PKCE popup — the
 * flow Microsoft prescribes for SPAs. There is no Microsoft-hosted auth
 * script to lazy-load (their CDN stopped publishing MSAL at v2), and a
 * vendored 200 KB library is not worth one scope and one flow; the
 * whole exchange is ~100 lines against two documented endpoints. The
 * client id is public by design; PKCE replaces the client secret. The
 * refresh token persists in browser storage so return visits skip the
 * popup (Microsoft caps SPA refresh tokens at ~24h, after which the
 * popup reappears once).
 *
 * Files go through graph.microsoft.com with the Files.ReadWrite
 * delegated scope — one uniform code path for personal and work/school
 * OneDrive. The picker is an in-app panel over Graph folder listings,
 * NOT Microsoft's embedded picker: that widget needs cross-site cookies
 * and resource-specific token brokering, which break in Safari.
 * Content reads use @microsoft.graph.downloadUrl — the /content
 * endpoint answers with a 302 that CORS forbids for browser requests
 * carrying an Authorization header.
 */
import { onedriveConfig } from './config.js';
import { track, noteMapSource } from './analytics.js';
import { initModal } from './a11y.js';
import { storage } from './storage.js';

const AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
	TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
	GRAPH = 'https://graph.microsoft.com/v1.0',
	SCOPE = 'https://graph.microsoft.com/Files.ReadWrite offline_access openid profile',
	ACCOUNT_KEY = 'because.onedrive.account',
	RT_KEY = 'because.onedrive.refresh',
	OPENABLE = /\.(mup|json)$/i;

export function makeOneDrive(engine, io, status) {
	let accessToken = null,
		tokenExpiresAt = 0,
		accountHint = storage.read(ACCOUNT_KEY),
		refreshToken = storage.read(RT_KEY),
		currentFile = null; // {id, name, webUrl} while the open map lives in OneDrive

	const b64url = bytes => window.btoa(String.fromCharCode.apply(null, bytes))
			.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
		randomString = function () {
			const bytes = new Uint8Array(32);
			window.crypto.getRandomValues(bytes);
			return b64url(bytes);
		},
		saveTokens = function (data) {
			accessToken = data.access_token;
			tokenExpiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
			if (data.refresh_token) {
				refreshToken = data.refresh_token;
				storage.write(RT_KEY, refreshToken);
			}
			if (data.id_token) {
				// display / login-hint use only, so no signature validation
				try {
					const claims = JSON.parse(window.atob(
							data.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))),
						email = claims.preferred_username || claims.email;
					if (email) {
						accountHint = email;
						storage.write(ACCOUNT_KEY, email);
					}
				} catch (e) { /* non-fatal */ }
			}
		},
		tokenRequest = async function (params) {
			const resp = await window.fetch(TOKEN_URL, {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: new window.URLSearchParams(Object.assign(
						{ client_id: onedriveConfig.clientId, scope: SCOPE }, params)).toString()
				}),
				data = await resp.json().catch(() => ({}));
			if (!resp.ok) {
				throw new Error('Microsoft sign-in failed: ' +
					String(data.error_description || data.error || resp.status).slice(0, 200));
			}
			saveTokens(data);
			return accessToken;
		},
		authInteractive = async function (forceSelect) {
			const stateVal = randomString(),
				verifier = randomString(),
				redirectUri = window.location.origin + '/app/auth-popup.html',
				params = {
					client_id: onedriveConfig.clientId,
					response_type: 'code',
					redirect_uri: redirectUri,
					scope: SCOPE,
					state: stateVal,
					response_mode: 'query'
				};
			// crypto.subtle exists only in secure contexts; production is
			// https, but plain-http dev origins fall back to the plain method
			if (window.crypto.subtle) {
				const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
				params.code_challenge = b64url(new Uint8Array(digest));
				params.code_challenge_method = 'S256';
			} else {
				params.code_challenge = verifier;
				params.code_challenge_method = 'plain';
			}
			if (forceSelect) {
				params.prompt = 'select_account';
			} else if (accountHint) {
				// pins multi-account browsers to the account that granted
				// access, and lets an alive session re-issue without UI
				params.login_hint = accountHint;
			}
			const popup = window.open(AUTH_URL + '?' + new window.URLSearchParams(params),
				'because-ms-auth', 'width=480,height=640');
			if (!popup) {
				throw new Error('Microsoft sign-in popup was blocked — use File > Save to sign in again.');
			}
			const code = await new Promise(function (resolve, reject) {
				const timer = window.setInterval(function () {
						if (popup.closed) { cleanup(); reject(new Error('popup_closed')); }
					}, 400),
					cleanup = function () {
						window.clearInterval(timer);
						window.removeEventListener('message', onMessage);
					},
					onMessage = function (e) {
						if (e.origin !== window.location.origin || !e.data || e.data.msAuth !== true ||
								e.data.state !== stateVal) {
							return;
						}
						cleanup();
						try { popup.close(); } catch (ignore) { /* already closed */ }
						if (e.data.code) {
							resolve(e.data.code);
						} else {
							reject(new Error(e.data.error || 'access_denied'));
						}
					};
				window.addEventListener('message', onMessage);
			});
			return tokenRequest({
				grant_type: 'authorization_code',
				code: code,
				redirect_uri: redirectUri,
				code_verifier: verifier
			});
		},
		ensureToken = async function (forceSelect) {
			if (!forceSelect && accessToken && Date.now() < tokenExpiresAt - 60000) {
				return accessToken;
			}
			if (!forceSelect && refreshToken) {
				try {
					return await tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken });
				} catch (e) {
					// stale grant — forget it and fall through to the popup
					refreshToken = null;
					storage.remove(RT_KEY);
				}
			}
			return authInteractive(forceSelect);
		},
		graphFetch = async function (path, options) {
			const token = await ensureToken(),
				resp = await window.fetch(GRAPH + path, Object.assign({}, options, {
					headers: Object.assign(
						{ Authorization: 'Bearer ' + token },
						(options && options.headers) || {})
				}));
			if (resp.status === 401) {
				accessToken = null;
				throw new Error('Microsoft sign-in expired. Please try again.');
			}
			if (!resp.ok) {
				throw new Error('OneDrive error ' + resp.status + ': ' + (await resp.text()).slice(0, 300));
			}
			return resp;
		},
		showError = function (e) {
			// popup dismissed / permission declined are normal cancellations
			const benign = /popup_closed|access_denied|user_cancel/i.test(String(e && e.message));
			if (!benign) {
				track('onedrive_error', { description: String((e && e.message) || e) });
				window.alert(String((e && e.message) || e));
			}
		},
		listChildren = async function (folderId) {
			const path = folderId ?
					'/me/drive/items/' + encodeURIComponent(folderId) + '/children' :
					'/me/drive/root/children',
				resp = await graphFetch(path + '?$select=id,name,folder,file,webUrl&$orderby=name&$top=500'),
				data = await resp.json();
			return data.value || [];
		},
		// in-app folder browser over Graph listings; resolves the picked
		// {id, name, webUrl} or null on cancel
		pickFile = function () {
			return new Promise(function (resolve) {
				let settled = false,
					modal = null;
				const stack = [], // descended folders, root not included
					overlay = document.createElement('div'),
					finish = function (value) {
						if (!settled) {
							settled = true;
							modal.close();
							resolve(value);
						}
					};
				overlay.className = 'panel-overlay';
				overlay.innerHTML = '<div class="panel od-panel"><h2>Open from OneDrive</h2>' +
					'<div class="od-crumb"><button type="button" class="od-up" hidden>‹ Back</button>' +
					'<span class="od-path">OneDrive</span></div>' +
					'<div class="od-status">Loading…</div>' +
					'<ul class="od-list"></ul>' +
					'<div class="panel-close"><button type="button">Cancel</button></div></div>';
				document.body.appendChild(overlay);
				modal = initModal(overlay, { onRequestClose: () => finish(null) });
				const list = overlay.querySelector('.od-list'),
					statusEl = overlay.querySelector('.od-status'),
					pathEl = overlay.querySelector('.od-path'),
					upBtn = overlay.querySelector('.od-up'),
					render = async function () {
						pathEl.textContent = ['OneDrive'].concat(stack.map(f => f.name)).join(' › ');
						upBtn.hidden = !stack.length;
						statusEl.hidden = false;
						statusEl.textContent = 'Loading…';
						list.textContent = '';
						try {
							const items = await listChildren(stack.length ? stack[stack.length - 1].id : null),
								folders = items.filter(it => it.folder),
								files = items.filter(it => it.file && OPENABLE.test(it.name));
							folders.concat(files).forEach(function (it) {
								const li = document.createElement('li'),
									btn = document.createElement('button');
								btn.type = 'button';
								btn.className = 'od-item';
								btn.textContent = (it.folder ? '📁 ' : '📄 ') + it.name;
								btn.addEventListener('click', function () {
									if (it.folder) {
										stack.push(it);
										render();
									} else {
										finish(it);
									}
								});
								li.appendChild(btn);
								list.appendChild(li);
							});
							if (folders.length || files.length) {
								statusEl.hidden = true;
							} else {
								statusEl.textContent = 'No argument maps (.mup) in this folder.';
							}
						} catch (e) {
							statusEl.textContent = String((e && e.message) || e);
							track('onedrive_error', { description: String((e && e.message) || e) });
						}
					};
				upBtn.addEventListener('click', function () {
					stack.pop();
					render();
				});
				overlay.querySelector('.panel-close button').addEventListener('click', () => finish(null));
				overlay.addEventListener('click', function (e) {
					if (e.target === overlay) { finish(null); }
				});
				render();
			});
		},
		saveToOneDrive = async function (asCopy, opts) {
			const auto = !!(opts && opts.auto),
				text = engine.serialize();
			let name = io.fileName();
			if (asCopy || !currentFile) {
				// an auto-save must never open a prompt; it only ever runs
				// while a OneDrive file is current, so this is a safety net
				if (auto) { throw new Error('auto-save has no OneDrive file to write to'); }
				const suggested = (name === 'untitled.mup' && engine.mapModel.getIdea()) ?
					rootTitleName() : name;
				name = window.prompt('Save in OneDrive as:', suggested);
				if (!name) { return false; }
				if (!/\.mup$/i.test(name)) { name += '.mup'; }
			}
			if (currentFile && !asCopy) {
				await graphFetch('/me/drive/items/' + encodeURIComponent(currentFile.id) + '/content', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/octet-stream' },
					body: text
				});
				track('map_save', { destination: 'onedrive', mode: auto ? 'auto' : 'save' });
				io.markSaved(currentFile.name);
				return true;
			}
			const resp = await graphFetch('/me/drive/root:/' + encodeURIComponent(name) +
					':/content?@microsoft.graph.conflictBehavior=rename', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/octet-stream' },
					body: text
				}),
				meta = await resp.json();
			track('map_save', { destination: 'onedrive', mode: asCopy ? 'save_copy' : 'save_as' });
			// claim Save before recording the file: claiming releases the
			// previous target, and that release clears currentFile
			io.setSaveTarget(o => onedrive.save(false, o), () => { currentFile = null; });
			currentFile = { id: meta.id, name: meta.name, webUrl: meta.webUrl };
			io.markSaved(meta.name);
			return true;
		},
		rootTitleName = function () {
			const idea = engine.mapModel.getIdea(),
				roots = idea && idea.ideas && Object.values(idea.ideas),
				title = (roots && roots[0] && roots[0].title) || 'My argument';
			return title.slice(0, 60).replace(/[\\/:*?"<>|]/g, '') + '.mup';
		};

	const onedrive = {
		isConfigured: () => !!onedriveConfig.clientId,
		currentFile: () => currentFile,
		account: () => accountHint,
		// forget the pinned account and re-run the account picker
		async switchAccount() {
			accessToken = null;
			refreshToken = null;
			accountHint = null;
			storage.remove(ACCOUNT_KEY);
			storage.remove(RT_KEY);
			try {
				await ensureToken(true); // shows the account picker
				window.alert('OneDrive is now connected as ' +
					(accountHint || 'the chosen account') + '.');
			} catch (e) {
				showError(e);
			}
		},
		open() {
			io.guardUnsaved(async function () {
				try {
					// sign in first, inside the click, so the popup opens
					// before any await could outlive the user gesture
					await ensureToken();
					const doc = await pickFile();
					if (!doc) { return; }
					const metaResp = await graphFetch('/me/drive/items/' + encodeURIComponent(doc.id) +
							'?$select=id,name,webUrl,@microsoft.graph.downloadUrl'),
						meta = await metaResp.json(),
						contentResp = await window.fetch(meta['@microsoft.graph.downloadUrl']),
						text = await contentResp.text();
					noteMapSource('onedrive');
					io.loadJson(JSON.parse(text), doc.name); // releases the previous save target
					io.setSaveTarget(o => onedrive.save(false, o), () => { currentFile = null; });
					currentFile = { id: doc.id, name: doc.name, webUrl: meta.webUrl || doc.webUrl };
				} catch (e) {
					showError(e);
				}
			});
		},
		async save(asCopy, opts) {
			const auto = !!(opts && opts.auto);
			try {
				return await saveToOneDrive(asCopy, opts);
			} catch (e) {
				if (auto) { throw e; } // auto-save handles it silently
				if (!asCopy && currentFile && /error (403|404|423)/.test(String(e && e.message))) {
					track('onedrive_error', { description: String((e && e.message) || e) });
					if (window.confirm('Couldn’t save to “' + currentFile.name + '” — OneDrive says the ' +
							'file can’t be written' + (accountHint ? ' by ' + accountHint : '') +
							' (deleted, locked, or view-only).\n\nSave your current map as a NEW OneDrive file instead?')) {
						return onedrive.save(true, opts);
					}
					return false;
				}
				showError(e);
				return false;
			}
		}
	};
	return onedrive;
}
