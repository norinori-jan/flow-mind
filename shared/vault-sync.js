/**
 * vault-sync.js
 * crypto-vault → flow-mind の一方向連携（メタデータのみ）。
 * drive-keep-sync.jsの「既知IDと比較して新規分だけ処理する」パターンを踏襲。
 *
 * 使い方:
 *   <script src="./shared/vault-sync.js"></script>
 *   VaultSync.setConfig(endpoint, token)
 *   const newItems = await VaultSync.pullNew()   // 既知でないものだけ返す
 */
(function (global) {
  'use strict';

  const LS_ENDPOINT = 'vaultsync_endpoint';
  const LS_TOKEN = 'vaultsync_token';
  const LS_KNOWN_IDS = 'vaultsync_known_ids';
  const LS_LAST_SYNC = 'vaultsync_last_sync';

  function getConfig() {
    return {
      endpoint: (localStorage.getItem(LS_ENDPOINT) || '').trim(),
      token: (localStorage.getItem(LS_TOKEN) || '').trim(),
    };
  }

  function setConfig(endpoint, token) {
    localStorage.setItem(LS_ENDPOINT, (endpoint || '').trim());
    localStorage.setItem(LS_TOKEN, (token || '').trim());
  }

  function isConfigured() {
    const c = getConfig();
    return !!(c.endpoint && c.token);
  }

  function getKnownIds() {
    try {
      return new Set(JSON.parse(localStorage.getItem(LS_KNOWN_IDS) || '[]'));
    } catch { return new Set(); }
  }

  function addKnownIds(ids) {
    const known = getKnownIds();
    ids.forEach(id => known.add(id));
    localStorage.setItem(LS_KNOWN_IDS, JSON.stringify([...known]));
  }

  /**
   * 現在のスナップショットを取得し、まだ取り込んでいない項目だけを返す。
   * @returns {Promise<Array<{id, title, category, updatedAt}>>}
   */
  async function pullNew() {
    const c = getConfig();
    if (!c.endpoint || !c.token) return [];

    const res = await fetch(`${c.endpoint.replace(/\/$/, '')}/api/vault/pull`, {
      headers: { 'X-Vault-Token': c.token },
    });
    if (!res.ok) throw new Error(`vault-sync pull failed: ${res.status}`);
    const data = await res.json();
    const items = data.items || [];

    const known = getKnownIds();
    const newItems = items.filter(it => it.id && !known.has(it.id));

    if (newItems.length) addKnownIds(newItems.map(it => it.id));
    localStorage.setItem(LS_LAST_SYNC, String(Date.now()));
    return newItems;
  }

  function getLastSyncedAt() {
    const v = localStorage.getItem(LS_LAST_SYNC);
    return v ? Number(v) : null;
  }

  global.VaultSync = {
    getConfig,
    setConfig,
    isConfigured,
    pullNew,
    getLastSyncedAt,
  };

  console.log('[vault-sync] loaded');
})(window);