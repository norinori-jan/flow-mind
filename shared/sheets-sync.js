/**
 * sheets-sync.js
 * Google スプレッドシートをキュー代わりに使う一方向連携（Sheets → flow-mind）。
 *
 * 想定運用: 電車の中でiPhoneのGoogle Sheetsアプリに直接メモを1行追加する
 * （title列・body列だけ書けばOK）。次にflow-mindを開いたとき、または
 * 「今すぐ同期」を押したときに、そのメモが自動でノード化される。
 *
 * DriveKeepSync(OAuthトークン方式・ページリロードのたびに再許可が必要)と違い、
 * 固定トークン方式(cloud-sync.jsと同じ考え方)なので、開くたびの再許可が要らない。
 *
 * 使い方:
 *   <script src="./shared/sheets-sync.js"></script>
 *   const ss = window.SheetsSync;
 *   ss.setConfig(webAppUrl, token)
 *   ss.isConfigured()
 *   const items = await ss.pull()   // [{id,title,body,timestamp}]
 */
(function (global) {
  'use strict';

  const LS_URL   = 'sheetssync_url';
  const LS_TOKEN = 'sheetssync_token';
  const LS_LAST  = 'sheetssync_last';

  function getConfig() {
    return {
      url:   (localStorage.getItem(LS_URL)   || '').trim(),
      token: (localStorage.getItem(LS_TOKEN) || '').trim(),
    };
  }

  function setConfig(url, token) {
    localStorage.setItem(LS_URL, (url || '').trim());
    localStorage.setItem(LS_TOKEN, (token || '').trim());
  }

  function isConfigured() {
    const c = getConfig();
    return !!(c.url && c.token);
  }

  /**
   * 未取得の行を取得する。サーバー側(Code.gs)が返した行を自動で
   * 'fetched' としてマークするため、同じ行が二重に返ってくることはない。
   *
   * fetch()ではなく<script>タグ経由のJSONPで呼び出している。Apps ScriptのWebアプリは
   * fetch()からのCORSヘッダーが不安定で、ブラウザ側でブロックされることがあるため
   * （<script>タグの読み込みはCORSの対象外なので確実に動く）。
   *
   * @returns {Promise<Array<{id:string,title:string,body:string,timestamp:number}>>}
   */
  function pull() {
    const c = getConfig();
    if (!c.url || !c.token) return Promise.resolve([]);

    return new Promise((resolve, reject) => {
      const cbName = '_sheetsSyncCb_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
      const script = document.createElement('script');

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('タイムアウトしました（15秒応答なし）'));
      }, 15000);

      function cleanup() {
        clearTimeout(timer);
        delete global[cbName];
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      global[cbName] = function (data) {
        cleanup();
        if (data && data.error) { reject(new Error(data.error)); return; }
        localStorage.setItem(LS_LAST, String(Date.now()));
        resolve((data && data.items) || []);
      };

      const sep = c.url.includes('?') ? '&' : '?';
      script.src = `${c.url}${sep}action=list&token=${encodeURIComponent(c.token)}&callback=${cbName}`;
      script.onerror = () => { cleanup(); reject(new Error('スクリプトの読み込みに失敗しました（URLを確認してください）')); };
      document.head.appendChild(script);
    });
  }

  function getLastSyncedAt() {
    const v = localStorage.getItem(LS_LAST);
    return v ? Number(v) : null;
  }

  global.SheetsSync = {
    getConfig,
    setConfig,
    isConfigured,
    pull,
    getLastSyncedAt,
  };

  console.log('[sheets-sync] loaded');
})(window);