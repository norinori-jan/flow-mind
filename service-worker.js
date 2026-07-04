// flow-mind Service Worker
const CACHE = 'flow-mind-v2';
const ASSETS = [
  './',
  './index.html',
  './hub.html',
  './manifest.json',
  './icons/icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // 自分のサイト（同一オリジン）以外への通信は、キャッシュ処理を挟まず常にそのまま素通りさせる。
  // AI API・Cloudflare Worker(sync-worker/cloud-sync)・その他どんな外部サービスが増えても
  // ここを個別に列挙する必要がないようにするための修正。
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) {
    return; // e.respondWith を呼ばない＝Service Workerは何もせず、ブラウザの通常通信に任せる
  }

  // GET以外（POST/PUT等）は同一オリジンでもキャッシュ対象外
  if (e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});


