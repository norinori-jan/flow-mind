/* ─────────────────────────────
   drive-keep-sync.js
   Google Drive経由のGoogle Keep擬似双方向同期（flow-mind専用）
   - スコープは https://www.googleapis.com/auth/drive.file のみ
     (このアプリが作成したファイルにしかアクセスしない、最も安全な範囲)
   - Keep本体には一切接続しない。Drive上の専用フォルダをKeep代わりに使う
   - 認証はGoogle Identity Services (GIS) のトークンクライアント方式
     (バックエンドを持たないため、リフレッシュトークンは使わない。
      アクセストークンはページを開いている間のみ有効で、リロードすると失効する)
───────────────────────────── */
(function (global) {
  const LS_CLIENT_ID = 'fm_drive_keep_client_id';
  const LS_FOLDER_ID = 'fm_drive_keep_folder_id';
  const LS_LAST_SYNC = 'fm_drive_keep_last_sync';
  const FOLDER_NAME = 'flow-mind-keep-sync';
  const SCOPE = 'https://www.googleapis.com/auth/drive.file';

  let tokenClient = null;
  let accessToken = null;
  let tokenExpiresAt = 0;

  function log(...args) { console.log('[drive-keep-sync]', ...args); }

  function getClientId() { return localStorage.getItem(LS_CLIENT_ID) || ''; }
  function setClientId(id) { localStorage.setItem(LS_CLIENT_ID, (id || '').trim()); }
  function isConfigured() { return !!getClientId(); }
  function isAuthorized() { return !!accessToken && Date.now() < tokenExpiresAt; }
  function getLastSyncedAt() { return Number(localStorage.getItem(LS_LAST_SYNC) || 0); }

  function ensureGisLoaded() {
    return new Promise((resolve, reject) => {
      if (global.google && global.google.accounts && global.google.accounts.oauth2) {
        resolve();
        return;
      }
      const check = setInterval(() => {
        if (global.google && global.google.accounts && global.google.accounts.oauth2) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        reject(new Error('Google Identity Servicesの読み込みに失敗しました(ネットワークを確認してください)'));
      }, 8000);
    });
  }

  async function authorize() {
    const clientId = getClientId();
    if (!clientId) throw new Error('クライアントIDが未設定です');
    await ensureGisLoaded();
    return new Promise((resolve, reject) => {
      try {
        tokenClient = global.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPE,
          callback: (resp) => {
            if (resp.error) { reject(new Error(resp.error)); return; }
            accessToken = resp.access_token;
            tokenExpiresAt = Date.now() + (resp.expires_in || 3600) * 1000;
            log('authorized, expires in', resp.expires_in, 'sec');
            resolve(accessToken);
          },
        });
        tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
      } catch (e) { reject(e); }
    });
  }

  async function apiFetch(url, options = {}) {
    if (!isAuthorized()) throw new Error('未認可です。先に「連携を許可」を押してください');
    const res = await fetch(url, {
      ...options,
      headers: { ...(options.headers || {}), 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Drive API error ${res.status}: ${text.slice(0, 200)}`);
    }
    return res;
  }

  async function ensureFolder() {
    let folderId = localStorage.getItem(LS_FOLDER_ID);
    if (folderId) return folderId;

    const q = encodeURIComponent(
      `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`
    );
    const searchRes = await apiFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`);
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
      folderId = searchData.files[0].id;
    } else {
      const createRes = await apiFetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
      });
      const createData = await createRes.json();
      folderId = createData.id;
    }
    localStorage.setItem(LS_FOLDER_ID, folderId);
    return folderId;
  }

  // 1ノード → 1JSONファイルとしてDriveへ作成/更新
  async function pushNode(node) {
    const folderId = await ensureFolder();
    const payload = JSON.stringify({
      title: node.label || '無題',
      body: node.memo || '',
      updatedAt: Date.now(),
    });

    if (node.driveFileId) {
      // 既存ファイルの中身だけ更新（メタデータ・ファイル名は変更しない）
      await apiFetch(`https://www.googleapis.com/upload/drive/v3/files/${node.driveFileId}?uploadType=media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      return node.driveFileId;
    }

    const metadata = { name: `flow-mind-node-${node.id}.json`, parents: [folderId] };
    const boundary = 'flowmindkeepboundary';
    const multipartBody =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\nContent-Type: application/json\r\n\r\n${payload}\r\n` +
      `--${boundary}--`;

    const createRes = await apiFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body: multipartBody,
    });
    const createData = await createRes.json();
    return createData.id;
  }

  // フォルダ内の新規ファイル(=knownFileIdsに無いもの)を取得
  async function pullNewNotes(knownFileIds) {
    const folderId = await ensureFolder();
    const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const listRes = await apiFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)`);
    const listData = await listRes.json();
    const files = listData.files || [];
    const known = new Set(knownFileIds || []);
    const newFiles = files.filter(f => !known.has(f.id));

    const results = [];
    for (const f of newFiles) {
      try {
        const contentRes = await apiFetch(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`);
        const data = await contentRes.json();
        results.push({
          fileId: f.id,
          title: data.title || f.name,
          body: data.body || '',
          updatedAt: data.updatedAt,
        });
      } catch (e) {
        log('pull item failed', f.id, e);
      }
    }
    localStorage.setItem(LS_LAST_SYNC, String(Date.now()));
    return results;
  }

  global.DriveKeepSync = {
    setClientId, isConfigured, authorize, isAuthorized, pushNode, pullNewNotes, getLastSyncedAt,
  };
})(window);