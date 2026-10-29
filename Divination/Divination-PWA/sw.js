const CACHE = 'divination-v40-navigation-number';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './data.js',
  './qian-en.js',
  './traditional-algorithms.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './THIRD_PARTY_NOTICES.txt'
];
const APP_PATHS = new Set(ASSETS.map(asset => new URL(asset, self.location.href).pathname));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('divination-') && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
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
