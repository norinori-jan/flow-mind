// flow-mind Service Worker
// v5: 連携(quick-ref ⇄ flow-mind)を「最初から更新が届く」形に作り直し
//  - ページ本体(HTML)と shared/*.js は「ネット優先」→ 更新がすぐ届く。圏外時だけキャッシュ
//  - 画像・マニフェストなど変わらないものだけキャッシュ優先
//  - インストールは1ファイル失敗しても止まらない(addAllは全滅するため個別add)
//  - 外部通信(同期Worker等)は一切さわらない
const CACHE_NAME = 'flow-mind-shell-v5';

const APP_SHELL = [
  './index.html',
  './manifest.flow-mind.json',
  './icons/icon.svg',
  './shared/sync-bridge.js',
  './shared/cloud-sync.js',
  './shared/drive-keep-sync.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(APP_SHELL.map(async u => {
        try { await cache.add(new Request(u, { cache: 'reload' })); } catch (e) { /* 1件失敗しても続行 */ }
      }));
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
    }
    return res;
  } catch (e) {
    const cached = await caches.match(req, { ignoreSearch: true });
    return cached || Response.error();
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isDoc = req.mode === 'navigate' || req.destination === 'document';
  const isScript = req.destination === 'script' || /\.(js|json)$/.test(url.pathname);
  if (isDoc || isScript) {
    event.respondWith(networkFirst(req));
    return;
  }
  event.respondWith(caches.match(req).then(c => c || networkFirst(req)));
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
