/**
 * sync-bridge.js
 * iPhone(Safari/PWA)とWindows(Chrome/Edge)の両方でiCloud Driveと連携するための共有モジュール。
 */
(function(global) {
  'use strict';

  const IDB_NAME = 'sync-bridge-db';
  const IDB_STORE = 'handles';
  const LS_PREFIX = 'syncbridge_last_';

  // ── 設定チェック関数
  // SyncBridge自身が扱うのは「Windows/PCのフォルダ同期(File System Access API)」機能のみ。
  // CloudSync(cloudsync_endpoint等)やDriveKeepSync(fm_drive_keep_client_id等)のキーは
  // 別モジュールの管轄であり、ここから参照しない(モジュール間の結合を避けるため)。
  // 環境がフォルダ同期に対応しているかどうかを返す、同期的に呼べる簡易チェックとする。
  function isConfigured() {
    return isDesktopCapable();
  }

  // ── IndexedDBにFileSystemDirectoryHandleを保存する薄いラッパー
  function openIdb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    });
  }

  async function idbGet(key) {
    const db = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(key);
      tx.onsuccess = () => resolve(tx.result || null);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbSet(key, value) {
    const db = await openIdb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).put(value, key);
      tx.onsuccess = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // ── 能力判定
  function isDesktopCapable() {
    return typeof window.showDirectoryPicker === 'function';
  }

  // ── Windows: フォルダ接続
  const handleCache = {}; // appName -> FileSystemDirectoryHandle（メモリキャッシュ）

  async function connectFolder(appName) {
    if (!isDesktopCapable()) throw new Error('このブラウザはフォルダ同期に対応していません（Windows版Chrome/Edgeでお試しください）');
    const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    await idbSet('dir_' + appName, dirHandle);
    handleCache[appName] = dirHandle;
    return dirHandle;
  }

  async function getFolderHandle(appName) {
    if (handleCache[appName]) return handleCache[appName];
    try {
      const h = await idbGet('dir_' + appName);
      if (h) handleCache[appName] = h;
      return h;
    } catch { return null; }
  }

  async function isConnected(appName) {
    const h = await getFolderHandle(appName);
    return !!h;
  }

  /** 権限を確認し、必要なら再要求する */
  async function ensurePermission(dirHandle) {
    const opts = { mode: 'readwrite' };
    if ((await dirHandle.queryPermission(opts)) === 'granted') return true;
    if ((await dirHandle.requestPermission(opts)) === 'granted') return true;
    return false;
  }

  // ── デバウンス書き込み管理
  const saveTimers = {};

  function autoSave(appName, dataObj) {
    clearTimeout(saveTimers[appName]);
    saveTimers[appName] = setTimeout(async () => {
      try {
        const dirHandle = await getFolderHandle(appName);
        if (!dirHandle) return;
        const ok = await ensurePermission(dirHandle);
        if (!ok) return;
        const fileHandle = await dirHandle.getFileHandle(`${appName}-sync.json`, { create: true });
        const writable = await fileHandle.createWritable();
        const payload = { timestamp: Date.now(), data: dataObj };
        await writable.write(JSON.stringify(payload));
        await writable.close();
        localStorage.setItem(LS_PREFIX + appName, String(payload.timestamp));
      } catch (e) {
        console.warn('[sync-bridge] autoSave failed:', e);
      }
    }, 1200);
  }

  async function autoLoad(appName) {
    try {
      const dirHandle = await getFolderHandle(appName);
      if (!dirHandle) return null;
      const ok = await ensurePermission(dirHandle);
      if (!ok) return null;
      const fileHandle = await dirHandle.getFileHandle(`${appName}-sync.json`, { create: false }).catch(() => null);
      if (!fileHandle) return null;
      const file = await fileHandle.getFile();
      const text = await file.text();
      const payload = JSON.parse(text);
      return payload;
    } catch (e) {
      console.warn('[sync-bridge] autoLoad failed:', e);
      return null;
    }
  }

  // ── iPhone / 共通: 手動エクスポート・インポート
  function exportToFiles(filename, dataObj) {
    const payload = { timestamp: Date.now(), data: dataObj };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    localStorage.setItem(LS_PREFIX + filename.replace(/\.json$/, ''), String(payload.timestamp));
  }

  function importFromFiles() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.style.display = 'none';
      input.addEventListener('change', async () => {
        const file = input.files && input.files[0];
        document.body.removeChild(input);
        if (!file) { resolve(null); return; }
        try {
          const text = await file.text();
          const parsed = JSON.parse(text);
          resolve(parsed);
        } catch (e) {
          console.warn('[sync-bridge] importFromFiles parse error:', e);
          resolve(null);
        }
      });
      document.body.appendChild(input);
      input.click();
    });
  }

  function getLastSyncedAt(appName) {
    const v = localStorage.getItem(LS_PREFIX + appName);
    return v ? Number(v) : null;
  }

  // ── グローバルへの公開（isConfiguredを含める）
  global.SyncBridge = {
    isConfigured,
    isDesktopCapable,
    connectFolder,
    isConnected,
    autoSave,
    autoLoad,
    exportToFiles,
    importFromFiles,
    getLastSyncedAt,
  };

  console.log('[sync-bridge] loaded (desktop capable:', isDesktopCapable(), ')');
})(window);