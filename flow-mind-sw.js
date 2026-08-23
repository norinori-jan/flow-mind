const CACHE_NAME = 'flow-mind-shell-v2';

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
      await cache.addAll(APP_SHELL);
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
      self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // HTML(ページ本体)は常にネットワークを優先する。
  // 開発中の更新をすぐ反映させるため。ネットワークが取れない時だけキャッシュにフォールバック。
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, res.clone());
          return res;
        } catch (e) {
          const cached = await caches.match(req);
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // それ以外の静的ファイルは従来通りキャッシュ優先
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});