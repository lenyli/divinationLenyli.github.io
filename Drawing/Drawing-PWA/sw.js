// 离线缓存
const CACHE = 'drawing-lots-v29';
const ASSETS = [
  './',
  './index.html',
  './app.js?v=29',
  './data.js?v=29',
  './programmatic-scroll.js?v=29',
  './assets/fonts/fahua-wenkai/FahuaWenKai-Regular.ttf',
  './assets/bamboo-slips.png',
  './assets/lotus-lacquer.png',
  './assets/cup-render.webp',
  './assets/sequence/cup-source.png',
  './assets/sequence/scroll-paper-source.png',
  './assets/sequence/scroll-roll-plain.png',
  './assets/sequence/lotus-overlay.png',
  './assets/sequence/bg-landscape-source.png',
  './assets/sequence/bg-portrait-source.png',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if (e.request.method === 'GET' && resp.ok && new URL(e.request.url).origin === location.origin) {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    }))
  );
});
