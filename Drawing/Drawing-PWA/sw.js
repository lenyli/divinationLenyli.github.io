const CACHE = 'drawing-lots-v31-public';
const ASSETS = [
  './',
  './index.html',
  './app.js?v=30',
  './data.js?v=30',
  './programmatic-scroll.js?v=30',
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
const APP_PATHS = new Set(ASSETS.map(asset => new URL(asset, self.location.href).pathname));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('drawing-lots-') && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim())
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then(clients => Promise.all(clients.map(client => client.navigate(client.url)))));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin || !APP_PATHS.has(url.pathname)) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(e.request);
    if (cached) return cached;
    const response = await fetch(e.request);
    if (response.ok) await cache.put(e.request, response.clone());
    return response;
  }));
});
