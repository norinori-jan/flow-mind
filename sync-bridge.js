/**
 * sync-bridge.js
 * iPhone(Safari/PWA)とWindows(Chrome/Edge)の両方でiCloud Driveと連携するための共有モジュール。
 *
 * 背景:
 *   - Windows/Chrome/Edge は File System Access API に対応しているので、
 *     iCloud Drive for Windows がローカルに同期しているフォルダへ直接
 *     読み書きでき、フォルダを1回選ぶだけで以降は自動同期にできる。
 *   - iPhone/Safari はこのAPIに非対応。書き出し(ダウンロード→「Filesに保存」で
 *     iCloud Driveを選択)と読み込み(ファイル選択でiCloud Driveから選ぶ)という
 *     手動フローになる。iOS標準のFiles統合を使うので追加のライブラリは不要。
 *
 * 使い方:
 *   <script src="https://norinori-jan.github.io/flow-mind/shared/sync-bridge.js"></script>
 *   const sync = window.SyncBridge;
 *
 *   // 能力判定
 *   sync.isDesktopCapable()                          // true: File System Access API対応
 *
 *   // Windows（フォルダに接続して自動同期）
 *   await sync.connectFolder('flow-mind')            // フォルダ選択ダイアログ
 *   sync.isConnected('flow-mind')                    // 接続済みか
 *   await sync.autoSave('flow-mind', dataObj)         // 変更のたびに呼ぶ（内部でデバウンス）
 *   const cloud = await sync.autoLoad('flow-mind')    // 起動時に呼ぶ。{ timestamp, data } | null
 *
 *   // iPhone（手動エクスポート/インポート、Filesアプリ経由でiCloud Driveへ）
 *   sync.exportToFiles('flow-mind-backup.json', dataObj)
 *   const imported = await sync.importFromFiles()     // { timestamp, data } | null （ユーザーがキャンセルすると null）
 *
 *   // 共通
 *   sync.getLastSyncedAt('flow-mind')                 // 最終同期時刻(ms) | null
 */
(function(global) {
  'use strict';

  const IDB_NAME = 'sync-bridge-db';
  const IDB_STORE = 'handles';
  const LS_PREFIX = 'syncbridge_last_';

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

  /** 権限を確認し、必要なら再要求する（再要求はユーザー操作のコンテキストが必要） */
  async function ensurePermission(dirHandle) {
    const opts = { mode: 'readwrite' };
    if ((await dirHandle.queryPermission(opts)) === 'granted') return true;
    if ((await dirHandle.requestPermission(opts)) === 'granted') return true;
    return false;
  }

  // ── デバウンス書き込み管理
  const saveTimers = {};

  /**
   * 変更のたびに呼ぶ。1.2秒デバウンスしてフォルダ内の <appName>-sync.json に書き込む。
   * フォルダ未接続の場合は何もしない（エラーにはしない＝呼び出し側は気にせず常に呼んでよい）。
   */
  function autoSave(appName, dataObj) {
    clearTimeout(saveTimers[appName]);
    saveTimers[appName] = setTimeout(async () => {
      try {
        const dirHandle = await getFolderHandle(appName);
        if (!dirHandle) return; // 未接続なら静かに何もしない
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

  /**
   * 起動時に呼ぶ。フォルダ内の <appName>-sync.json を読む。
   * @returns {Promise<{timestamp:number, data:any}|null>}
   */
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

  /**
   * ファイル選択ダイアログを開いてJSONを読み込む。
   * @returns {Promise<{timestamp:number, data:any}|null>} キャンセル時は null
   */
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

  global.SyncBridge = {
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

